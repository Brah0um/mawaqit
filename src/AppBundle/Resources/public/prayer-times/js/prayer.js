/* global dateTime */

/**
 * Class handling prayers 
 * @author ibrahim.zehhaf@gmail.com
 * @type {object}
 */

var prayer = {
    months: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
    /**
     * time to wait before hilight next prayer time  (in minutes)
     * @type Number
     */
    nextPrayerHilightWait: 5,
    /**
     * prayer times
     * @type Array
     */
    times: [],
    /**
     * One minute in milliseconds
     * @type Integer
     */
    oneMinute: 60000,
    /**
     * One second in milliseconds
     * @type Integer
     */
    oneSecond: 1000,
    /**
     * Conf from conf.json
     * @type Json
     */
    confData: confData,
    /**
     * init the app
     */
    init: function () {
        this.loadData();
        this.setBackgroundColor();
        this.setTime();
        this.setDate();
        this.setTimes();
        this.setWaitings();
        this.translateToArabic();
        this.initNextTimeHilight();
        this.initAdhanFlash();
        this.initIqamaFlash();
        this.initCronHandlingTimes();
        this.setCustomTime();
        this.initUpdateConfData();
        this.hideSpinner();
        douaaSlider.init();
    },
    /**
     * load all data
     */
    setBackgroundColor: function () {
        $("body").css("backgroundColor", prayer.confData.backgroundColor);
    },
    /**
     * load all data
     */
    loadData: function () {
        this.loadTimes();

        // if current time > ichaa time + 5 minutes we load tomorrow times
        var date = new Date();
        if (date.getHours() !== 0) {
            var ichaaDateTime = this.getCurrentDateForPrayerTime(this.getIchaTime());
            ichaaDateTime.setMinutes(ichaaDateTime.getMinutes() + this.nextPrayerHilightWait);
            if (date > ichaaDateTime) {
                this.loadTimes(true);
            }
        }
    },
    /**
     * 
     */
    initUpdateConfData: function () {
        setInterval(function () {
            $.ajax({
                url: "has-been-updated/" + prayer.confData.lastUpdatedDate,
                success: function (resp) {
                    if (resp.hasBeenUpdated === true) {
                        location.reload();
                    }
                }
            });
        }, prayer.oneSecond * 5);
    },
    /**
     * load prayer times
     * if calculChoice = csv we load from csv file
     * else we load from PrayTimes() function
     * @param {boolean} tomorrow if true we load tomorrow time, otherxise we load today times
     */
    loadTimes: function (tomorrow) {
        if (this.confData.calculChoice === "calendar") {
            this.loadTimesFromCalendar(tomorrow);
        } else if (this.confData.calculChoice === "api") {
            this.loadTimesFromApi(tomorrow);
        }
    },
    /**
     * @param {boolean} tomorrow 
     * @returns {Array}
     */
    loadTimesFromCalendar: function (tomorrow) {

        var month = dateTime.getCurrentMonth();
        var day = dateTime.getCurrentDay();
        if (typeof tomorrow === 'boolean' && tomorrow === true) {
            month = dateTime.getTomorrowMonth();
            day = dateTime.getTomorrowDay();
        }
        this.times = prayer.confData.calendar[month][day];

    },
    /**
     * @param {boolean} tomorrow 
     * Load times from PrayTimes API
     */
    loadTimesFromApi: function (tomorrow) {
        var prayTimes = new PrayTimes(prayer.confData.prayerMethod);
        if (prayer.confData.fajrDegree) {
            prayTimes.adjust({"fajr": parseFloat(prayer.confData.fajrDegree)});
        }
        if (prayer.confData.ichaaDegree) {
            prayTimes.adjust({"isha": parseFloat(prayer.confData.ichaaDegree)});
        }

        // times adjustment
        prayTimes.tune({
            fajr: prayer.confData.prayerTimesAdjustment[0],
            dhuhr: prayer.confData.prayerTimesAdjustment[1],
            asr: prayer.confData.prayerTimesAdjustment[2],
            maghrib: prayer.confData.prayerTimesAdjustment[3],
            isha: prayer.confData.prayerTimesAdjustment[4]
        });

        var date = new Date();
        if (typeof tomorrow === 'boolean' && tomorrow === true) {
            date = dateTime.tomorrow();
        }

//        var dst = dateTime.isDst(prayer.confData.timezone) ? '1' : '0';
        var dst = '1';
        var pt = prayTimes.getTimes(date, [prayer.confData.latitude, prayer.confData.longitude], 1, dst);
        if (prayer.confData.timezone !== null) {
            pt = prayTimes.getTimes(date, [prayer.confData.latitude, prayer.confData.longitude], prayer.confData.timezone, dst);
        }

        this.times = {
            1: pt.fajr,
            2: pt.sunrise,
            3: pt.dhuhr,
            4: pt.asr,
            5: pt.maghrib,
            6: pt.isha
        };
    },
    /**
     * get today prayer times, array of only five prayer times
     * @returns {Array}
     */
    getTimes: function () {
        var times = this.times;
        times = [times[1], times[3], times[4], times[5], times[6]];
        $.each(times, function (i, time) {
            times[i] = prayer.dstConvertTimeForCalendarMode(time);
            if (prayer.confData.prayerTimesFixing[i] && prayer.confData.prayerTimesFixing[i] > times[i]) {
                times[i] = prayer.confData.prayerTimesFixing[i];
            }
        });
        return times;
    },
    getTimeByIndex: function (index) {
        return this.getTimes()[index];
    },
    getWaitingByIndex: function (index) {
        var waiting = this.getWaitingTimes()[index];
        // if waiting fixed to 0 we adjust wating to 3 min for adhan and douaa
        if (waiting === 0)
        {
            waiting = 3;
        }
        return waiting;
    },
    /**
     * get prayer waiting taimes
     * @returns {Array}
     */
    getWaitingTimes: function () {
        var waitings = this.confData.prayersWaitingTimes;
        if (this.confData.maximumIchaTimeForNoWaiting !== "" && this.getIchaTime() >= this.confData.maximumIchaTimeForNoWaiting) {
            waitings[4] = 0;
        }
        return waitings;
    },
    /**
     * +1|-1 hour for time depending DST
     * @param {String} time
     * @returns {Array}
     */
    dstConvertTimeForCalendarMode: function (time) {
        if (prayer.confData.calculChoice === "calendar" && dateTime.isLastSundayDst()) {
            time = time.split(":");
            var hourPrayerTime = Number(time[0]) + (dateTime.getCurrentMonth() === 2 ? 1 : -1);
            var minutePrayerTime = time[1];
            time = addZero(hourPrayerTime) + ':' + minutePrayerTime;
        }
        return time;
    },
    /**
     * get current date object for given prayer time 
     * @param {String} time
     * @returns {Date}
     */
    getCurrentDateForPrayerTime: function (time) {
        var date = new Date();
        time = time.split(':');
        date.setHours(time[0]);
        date.setMinutes(time[1]);
        date.setSeconds(0);
        return date;
    },
    /**
     * get Ichaa time, if ichaa is <= then 19:50 then return 19:50 
     * @returns {String}
     */
    getIchaTime: function () {
        return this.getTimes()[4];
    },
    /**
     * get chourouk time
     * @returns {String}
     */
    getChouroukTime: function () {
        var chouroukTime = this.times[2];
        if (dateTime.isLastSundayDst()) {
            chouroukTime = prayer.dstConvertTimeForCalendarMode(chouroukTime);
        }
        return  chouroukTime;
    },
    /**
     * Get the imsak time calculated by soustraction of imsakNbMinBeforeSobh from sobh time
     * @returns {String}
     */
    getImsak: function () {
        var sobh = this.getTimeByIndex(0);
        var sobhDateTime = this.getCurrentDateForPrayerTime(sobh);
        var imsakDateTime = sobhDateTime.setMinutes(sobhDateTime.getMinutes() - this.confData.imsakNbMinBeforeSobh);
        var imsakDateTime = new Date(imsakDateTime);
        return addZero(imsakDateTime.getHours()) + ':' + addZero(imsakDateTime.getMinutes());
    },
    /**
     * init the cron that change prayer times by day
     * at midnight we change prayer times for the day
     * we check every minute
     */
    initCronHandlingTimes: function () {
        setInterval(function () {
            var date = new Date();
            if (date.getHours() === 0 && date.getMinutes() === 0) {
                prayer.setDate();
                prayer.loadTimes();
                prayer.setTimes();
                prayer.initNextTimeHilight();
            }

            prayer.setCustomTime();
        }, prayer.oneMinute);
    },
    /**
     * Check every minute if athan time is ok
     * if adhan time is ok we flash time
     * after one minute we stop flashing and show adhan douaa
     */
    adhanIsFlashing: false,
    initAdhanFlash: function () {
        setInterval(function () {
            if (!prayer.adhanIsFlashing) {
                var currentTime = dateTime.getCurrentTime(false);
                $(prayer.getTimes()).each(function (currentPrayerIndex, time) {
                    if (time === dateTime.getCurrentTime()) {
                        var prayerElm = $(".prayer:contains(" + currentTime + ")");
                        if (prayerElm.length) {
                            // if joumouaa time we don't flash adhan
                            if (!prayer.isJoumouaa(currentPrayerIndex)) {
                                prayer.adhanIsFlashing = true;
                                prayer.flashAdhan(currentPrayerIndex);
                            }
                        }
                    }
                });
            }
        }, prayer.oneSecond);
    },
    /**
     * Check every second if iqama time is ok
     * if ok we show iqama flashing for 30 sec
     */
    iqamaIsFlashing: false,
    initIqamaFlash: function () {
        setInterval(function () {
            if (!prayer.iqamaIsFlashing) {
                $(prayer.getTimes()).each(function (currentPrayerIndex, time) {
                    var diffTimeInMiniute = Math.floor((new Date() - prayer.getCurrentDateForPrayerTime(time)) / prayer.oneMinute);
                    var currentPrayerWaitingTime = prayer.getWaitingByIndex(currentPrayerIndex);
                    if (diffTimeInMiniute === currentPrayerWaitingTime) {
                        prayer.iqamaIsFlashing = true;
                        // iqama flashing
                        prayer.flashIqama(currentPrayerIndex);
                    }
                });
            }
        }, prayer.oneSecond);
    },
    /**
     * Flash adhan for 1 minute
     * @param {Number} currentPrayerIndex
     */
    flashAdhan: function (currentPrayerIndex) {
        // iqama countdown
        prayer.iqamaCountdown(currentPrayerIndex);
        // timeout for douaa show
        prayer.adhanDouaa.setTimeout(currentPrayerIndex);
        $(".top-content .content").addClass("hidden");

        var adhanFlashInterval = setInterval(function () {
            $(".top-content .adhan-flash").toggleClass("hidden");
            $(".mobile .prayer-content .adhan" + currentPrayerIndex).toggleClass("hidden");
            $(".mobile .prayer-content .prayer" + currentPrayerIndex).toggleClass("hidden");
        }, prayer.oneSecond);

        // timeout for stopping time flashing
        setTimeout(function () {
            clearInterval(adhanFlashInterval);
            prayer.adhanIsFlashing = false;
            $(".top-content .content").removeClass("hidden");
            $(".top-content .adhan-flash").addClass("hidden");
            $(".mobile .prayer-content .adhan" + currentPrayerIndex).addClass("hidden");
            $(".mobile .prayer-content .prayer" + currentPrayerIndex).removeClass("hidden");
        }, prayer.oneMinute);
    },
    /**
     * flash iqama for 30 sec
     * @param {Number} currentPrayerIndex 
     */
    flashIqama: function (currentPrayerIndex) {
        // init next hilight timeout
        prayer.setNextTimeHilight(currentPrayerIndex);
        // init douaa after prayer timeout
        douaaSlider.show(currentPrayerIndex);

        // if joumuaa time we don't flash iqama
        if (!prayer.isJoumouaa(currentPrayerIndex)) {
            var iqamaFlashInterval = setInterval(function () {
                $(".desktop .main").toggleClass("hidden");
                $(".desktop .iqama").toggleClass("hidden");
            }, prayer.oneSecond);
            // stop iqama flashing after 45 sec
            setTimeout(function () {
                clearInterval(iqamaFlashInterval);
                prayer.hideIqama();
            }, prayer.confData.iqamaDisplayTime * prayer.oneSecond);
        }
        // reset flag iqamaIsFlashing after one minute
        setTimeout(function () {
            prayer.iqamaIsFlashing = false;
        }, prayer.oneMinute);
    },
    /**
     * Set iqama countdonwn
     * @param {Number} currentPrayerIndex
     */
    iqamaCountdown: function (currentPrayerIndex) {
        var time = prayer.getTimeByIndex(currentPrayerIndex);
        var waiting = $(".prayer-wait ._" + currentPrayerIndex).text();
        var prayerTimeDate = prayer.getCurrentDateForPrayerTime(time);
        var prayerTimePlusWaiting = prayerTimeDate.setMinutes(prayerTimeDate.getMinutes() + prayer.getWaitingByIndex(currentPrayerIndex));
        var currentElem = $(".prayer-wait ._" + currentPrayerIndex);
        $(currentElem).countdown(prayerTimePlusWaiting, function (event) {
            $(this).text(event.strftime('%M:%S'));
        }).on('finish.countdown', function () {
            $(currentElem).text(waiting);
        });
    },
    hideIqama: function () {
        $(".desktop .main").removeClass("hidden");
        $(".desktop .iqama").addClass("hidden");
    },
    /**
     * serch and set the next prayer time hilight
     */
    initNextTimeHilight: function () {
        var date = new Date();
        // sobh is default
        prayer.hilightByIndex(0);
        var times = this.getTimes();
        $.each(times, function (index, time) {
            prayerDateTime = prayer.getCurrentDateForPrayerTime(time);
            // adding 15 minute
            prayerDateTime.setMinutes(prayerDateTime.getMinutes() + prayer.nextPrayerHilightWait);
            if (date > prayerDateTime) {
                index++;
                if (index === 5) {
                    index = 0;
                }
                prayer.hilightByIndex(index);
            }
        });
    },
    /**
     * hilight prayer by index
     * @param {Number} prayerIndex
     */
    hilightByIndex: function (prayerIndex) {
        var time = this.getTimeByIndex(prayerIndex);
        $(".prayer").removeClass("prayer-hilighted");
        $(".prayer-text .text").removeClass("text-hilighted");
        $(".prayer-wait .wait").removeClass("text-hilighted");

        // if joumouaa we hilight joumouaa time
        if (prayer.isJoumouaa(prayerIndex)) {
            $(".joumouaa-id").addClass("prayer-hilighted");
            return;
        }

        $(".prayer-text ._" + prayerIndex).addClass("text-hilighted");
        $(".prayer-wait ._" + prayerIndex).addClass("text-hilighted");
        $(".prayer:contains(" + time + ")").addClass("prayer-hilighted");
    },
    /**
     * 10 minute after current iqama we hilight the next prayer time
     * @param {int} currentTimeIndex 
     */
    setNextTimeHilight: function (currentTimeIndex) {
        nextTimeIndex = currentTimeIndex + 1;
        // if icha is the current prayer
        if (nextTimeIndex === 5) {
            nextTimeIndex = 0;
        }
        setTimeout(function () {
            prayer.hilightByIndex(nextTimeIndex);
            // if ichaa we load tomorrow times
            var date = new Date();
            if (nextTimeIndex === 0 && date.getHours() !== 0) {
                prayer.loadTimes(true);
                prayer.setTimes();
            }
        }, prayer.nextPrayerHilightWait * prayer.oneMinute);
    },
    adhanDouaa: {
        showAdhan: function () {
            $(".desktop .main").fadeOut(1000, function () {
                $(".desktop .adhan").fadeIn(1000);
            });
        },
        hideAdhan: function () {
            $(".desktop .adhan").fadeOut(1000, function () {
                $(".desktop .main").fadeIn(1000);
            });
        },
        showHadith: function () {
            $(".desktop .main").fadeOut(1000, function () {
                $(".desktop .douaa-between-adhan-iqama").fadeIn(1000);
            });
        },
        hideHadith: function () {
            $(".desktop .douaa-between-adhan-iqama").fadeOut(1000, function () {
                $(".desktop .main").fadeIn(1000);
            });
        },
        /**
         * show douaa 2.5 minutes after adhan flash
         * show douaa for configured time
         * show hadith to remeber importance of douaa between adhan and iqama, 3 minutes after adhan flash
         * @param {Number} currentPrayerIndex
         */
        setTimeout: function (currentPrayerIndex) {
            if (prayer.confData.douaaAfterAdhanEnabled === true) {
                setTimeout(function () {
                    prayer.adhanDouaa.showAdhan();
                    setTimeout(function () {
                        prayer.adhanDouaa.hideAdhan();

                        // show hadith between adhan and iqama
                        if (prayer.getWaitingTimes()[currentPrayerIndex] !== 0) {
                            setTimeout(function () {
                                prayer.adhanDouaa.showHadith();
                                setTimeout(function () {
                                    prayer.adhanDouaa.hideHadith();
                                }, 30 * prayer.oneSecond);
                            }, 30 * prayer.oneSecond);
                        }

                    }, prayer.confData.adhanDouaaDisplayTime * prayer.oneSecond);
                }, 150 * prayer.oneSecond);
            }
        }
    },
    /**
     * set time every second
     */
    setTime: function () {
        $(".time").text(dateTime.getCurrentTime(true));
        setInterval(function () {
            $(".time").text(dateTime.getCurrentTime(true));
        }, prayer.oneSecond);
    },
    /**
     * set date
     */
    setDate: function () {
        $(".gregorianDate").text(dateTime.getCurrentDate(lang));
        this.setCurrentHijriDate();
    },
    /**
     * set hijri date from hijriDate.js
     */
    setCurrentHijriDate: function () {
        if (prayer.confData.hijriDateEnabled === true) {
            $(".hijriDate").text(writeIslamicDate(prayer.confData.hijriAdjustment));
        }
    },
    /**
     * get joumouaa time depending dst
     * @returns {String}
     */
    getJoumouaaTime: function () {
        if (this.confData.joumouaaTime) {
            return this.confData.joumouaaTime;
        }
        return dateTime.isDst() ? "13:15" : "12:15";
    },
    /**
     * if current time is joumouaa
     * @param {int} currentPrayerIndex 
     * @returns {boolean}
     */
    isJoumouaa: function (currentPrayerIndex) {
        var date = new Date();
        return date.getDay() === 5 && currentPrayerIndex === 1;
    },
    /**
     * @param {string} time 
     * @returns {Number}
     */
    getPrayerIndexByTime: function (time) {
        var index = null;
        $.each(prayer.getTimes(), function (i, t) {
            if (t === time) {
                index = i;
            }
        });
        return  index;
    },
    /**
     * handle custom time
     * chourouk time
     * aid time if enabled
     * imsak time if enabled
     */
    setCustomTime: function () {
        // hide all custom times
        $(".custom-time").hide();

        // if aid time enabled we set/show it
        if (this.confData.aidTime) {
            $(".aid-id").text(this.confData.aidTime);
            $(".aid").show();
            return;
        }

        // set chourouk time
        $(".chourouk-id").text(this.getChouroukTime());

        // if imsak enabled
        if (parseInt(this.confData.imsakNbMinBeforeSobh) === 0) {
            $(".chourouk").show();
            return;
        }

        // if imsak time enabled we show it between chourouk + 1 hour and sobh
        var imsak = this.getImsak();
        $(".imsak-id").text(imsak);

        if (parseInt(this.confData.imsakNbMinBeforeSobh) !== 0) {
            var date = new Date();
            var midnight = new Date();
            midnight.setHours(0);
            midnight.setMinutes(0);
            midnight.setSeconds(0);
            var sobhDate = prayer.getCurrentDateForPrayerTime(prayer.getTimeByIndex(0));
            // if time betwwen midnight and sobh => show imsak
            if (date.getTime() < sobhDate.getTime() && date.getTime() > midnight.getTime()) {
                $(".imsak").show();
                return;
            }

            var chouroukDate = prayer.getCurrentDateForPrayerTime(prayer.getChouroukTime());
            chouroukDate = chouroukDate.setHours(chouroukDate.getHours() + 1);
            // if time > chourouk + 1 hour => show imsak
            if (date.getTime() > chouroukDate) {
                $(".imsak").show();
                return;
            }

            // default show chourouk
            $(".chourouk").show();
        }
    },
    /**
     * set all prayer times 
     */
    setTimes: function () {
        $(".sobh").text(this.getTimes()[0]);
        $(".dohr").text(this.getTimes()[1]);
        $(".asr").text(this.getTimes()[2]);
        $(".maghrib").text(this.getTimes()[3]);
        $(".ichaa").text(this.getIchaTime());
        $(".joumouaa-id").text(this.getJoumouaaTime());
    },
    /**
     * set wating times
     */
    setWaitings: function () {
        $(".wait").each(function (i, e) {
            $(e).text(prayer.getWaitingTimes()[i % 5] + "'");
        });
    },
    hideSpinner: function () {
        $(document).ready(function () {
            $(".main").fadeIn(1000, function () {
                $(".spinner").hide();
            });
        });
    },
    /**
     * Arabic handler
     */
    translateToArabic: function () {
        if (lang === "ar") {
            var texts = $(".prayer-text").find("div");
            var times = $(".prayer-time").find("div");
            var waits = $(".prayer-wait").find("div");
            for (var i = 4; i >= 0; i--) {
                $(".prayer-text").append(texts[i]);
                $(".prayer-time").append(times[i]);
                $(".prayer-wait").append(waits[i]);
            }
            $(".prayer-text, .joumouaa>div:first, .chourouk>div:first, .imsak>div:first").css("font-family", "Amiri");
            $(".adhan .fr, .douaa-between-adhan-iqama .fr").remove();
            $(".adhan .ar, .douaa-between-adhan-iqama .ar").css("font-size", "900%");
        }
    }
};

/**
 * Douaa slider class
 * @type {Object}
 */
var douaaSlider = {
    oneDouaaShowingTime: 20000,
    /**
     * it saves html (ul,li)
     * @type String
     */
    sliderHtmlContent: '',
    /**
     *  init douaa after prayer slider
     */
    init: function () {
        // if mobile device ignore douaa slider
        if ($(window).width() < 1200) {
            return;
        }

        var screenWidth = $(window).width();
        $('#slider ul li').width(screenWidth);
        var slideCount = $('#slider ul li').length;
        var sliderUlWidth = slideCount * screenWidth;
        $('#slider').css({width: screenWidth});
        $('#slider ul').css({width: sliderUlWidth, marginLeft: -screenWidth});
        $('#slider ul li:last-child').prependTo('#slider ul');
        if (prayer.confData.lang === "ar") {
            $("#slider .fr").remove();
        }
        //save html slider
        douaaSlider.sliderHtmlContent = $('#slider').html();
    },
    /**
     * If enabled show douaa after prayer for 5 minutes
     * @param {Number} currentTimeIndex
     */
    show: function (currentTimeIndex) {
        if (prayer.confData.douaaAfterPrayerEnabled === true && !prayer.isJoumouaa(currentTimeIndex)) {
            setTimeout(function () {
                $(".desktop .main").fadeOut(2000, function () {
                    $(".douaa-after-prayer").fadeIn(1000);
                });

                var douaaInterval = setInterval(function () {
                    douaaSlider.moveRight();
                }, douaaSlider.oneDouaaShowingTime);

                setTimeout(function () {
                    clearInterval(douaaInterval);
                    $(".douaa-after-prayer").fadeOut(2000, function () {
                        $(".desktop .main").fadeIn(1000);
                        $('#slider').html(douaaSlider.sliderHtmlContent);
                    });

                }, douaaSlider.getTimeForShow());
            }, prayer.confData.duaAfterPrayerShowTimes[currentTimeIndex] * prayer.oneMinute);
        }
    },
    /**
     * Number of seconds to show all douaa
     * @returns {Number}
     */
    getTimeForShow: function () {
        return ($('#slider ul li').length * this.oneDouaaShowingTime) - 1000;
    },
    moveRight: function () {
        var screenWidth = $(window).width();
        $('#slider ul').animate({
            left: -screenWidth
        }, 1000, function () {
            $('#slider ul li:first-child').appendTo('#slider ul');
            $('#slider ul').css('left', '');
        });
    }
};

$(document).ready(function () {
    prayer.init();
});
