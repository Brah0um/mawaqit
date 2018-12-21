/* global dateTime */
/* global douaaSlider */
/* global lang */
/* global confData */

/**
 * Class handling prayers
 * @author ibrahim.zehhaf@gmail.com
 * @type {object}
 */

var prayer = {
    /**
     * time to wait before hilight next prayer time  (in minutes)
     * @type Number
     */
    nextPrayerHilightWait: 20,
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
     * @type Json
     */
    isMosque: isMosque,
    confData: confData,
    /**
     * load all data
     */
    setBackgroundColor: function () {
        if (prayer.confData.backgroundType === 'color') {
            $("body").css("backgroundColor", prayer.confData.backgroundColor);
        }

        if (prayer.confData.backgroundType === 'motif') {
            $("body").css("backgroundImage", 'url("/bundles/app/prayer-times/img/background-' + prayer.confData.backgroundMotif + '.jpg")');
        }
    },
    /**
     * load all data
     */
    loadData: function () {
        this.loadTimes();

        // if current time > ichaa time + this.nextPrayerHilightWait minutes we load tomorrow times
        var date = new Date();
        if (date.getHours() !== 0) {
            var ichaaDateTime = this.getCurrentDateForPrayerTime(this.getIshaTime());
            if (ichaaDateTime.getHours() !== 0) {
                ichaaDateTime.setMinutes(ichaaDateTime.getMinutes() + this.nextPrayerHilightWait);
                if (date > ichaaDateTime) {
                    this.loadTimes(true);
                }
            }
        }
    },
    /**
     * check for update every 1 minute
     */
    initUpdateConfData: function () {
        var remote = $("#main").data("remote");
        setInterval(function () {
            $.ajax({
                url: remote + "?lastUpdatedDate=" + lastUpdated,
                success: function (resp) {
                    if (resp.hasBeenUpdated === true) {
                        location.reload();
                    }
                }
            });
        }, prayer.oneMinute);
    },
    /**
     * load prayer times
     * if sourceCalcul = csv we load from csv file
     * else we load from PrayTimes() function
     * @param {boolean} tomorrow if true we load tomorrow time, otherxise we load today times
     */
    loadTimes: function (tomorrow) {
        if (this.confData.sourceCalcul === "calendar") {
            this.loadTimesFromCalendar(tomorrow);
        } else if (this.confData.sourceCalcul === "api") {
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
     * Get dst for API prayer calcul
     * @returns {Integer}
     */
    getDst: function () {
        if (prayer.confData.dst === 1 && prayer.confData.dstSummerDate && prayer.confData.dstWinterDate) {
            var dstSummerDate = (new Date(prayer.confData.dstSummerDate)).getTime();
            var dstWinterDate = (new Date(prayer.confData.dstWinterDate)).getTime();
            var date = (new Date()).setHours(4);
            if (date > dstSummerDate && date < dstWinterDate) {
                return 1;
            }
            return 0;
        }

        return prayer.confData.dst;
    },

    /**
     * @param {boolean} tomorrow
     * Load times from PrayTimes API
     */
    loadTimesFromApi: function (tomorrow) {
        var prayTimes = new PrayTimes(prayer.confData.prayerMethod);

        if (prayer.confData.prayerMethod === "CUSTOM") {
            if (prayer.confData.fajrDegree) {
                prayTimes.adjust({"fajr": parseFloat(prayer.confData.fajrDegree)});
            }
            if (prayer.confData.ishaDegree) {
                prayTimes.adjust({"isha": parseFloat(prayer.confData.ishaDegree)});
            }
        }

        prayTimes.adjust({"asr": prayer.confData.asrMethod});

        if (prayer.confData.highLatsMethod) {
            prayTimes.adjust({"highLats": prayer.confData.highLatsMethod});
        }

        // times adjustment
        prayTimes.tune({
            fajr: prayer.confData.adjustedTimes[0],
            dhuhr: prayer.confData.adjustedTimes[1],
            asr: prayer.confData.adjustedTimes[2],
            maghrib: prayer.confData.adjustedTimes[3],
            isha: prayer.confData.adjustedTimes[4]
        });

        var date = new Date();
        if (typeof tomorrow === 'boolean' && tomorrow === true) {
            date = dateTime.tomorrow();
        }

        var pt = prayTimes.getTimes(date, [latitude, longitude], prayer.confData.timezone, prayer.getDst());

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
     * @param {boolean} tomorrow
     * @returns {Array}
     */
    getTimes: function (tomorrow) {
        var times = [this.times[1], this.times[3], this.times[4], this.times[5], this.times[6]];
        $.each(times, function (i, time) {
            times[i] = prayer.dstConvertTimeForCalendarMode(time, tomorrow);

            // adjust isha to 90 min after maghrib if option enabled
            if (i === 4 && prayer.confData.ishaFixation) {
                var maghribDateTime = prayer.getCurrentDateForPrayerTime(times[3]);
                maghribDateTime.setMinutes(maghribDateTime.getMinutes() + prayer.confData.ishaFixation);
                times[i] = addZero(maghribDateTime.getHours()) + ':' + addZero(maghribDateTime.getMinutes());
            }

            // handle fixed times
            // exception for isha when its at 00 o'clock
            if (i === 4 && times[i].startsWith('00')) {
                return false;
            }

            if (prayer.confData.fixedTimes[i] && prayer.confData.fixedTimes[i] > times[i]) {
                times[i] = prayer.confData.fixedTimes[i];
            }

        });
        return times;
    },
    getTimeByIndex: function (index) {
        return this.getTimes()[index];
    },
    getWaitingByIndex: function (index) {
        var waiting = this.getWaitingTimes()[index];
        // if waiting fixed to < 2 min we adjust it to 2 min for adhan and dua`a
        if (waiting <= 2) {
            waiting = 2;
        }
        return waiting;
    },
    /**
     * get prayer waiting taimes
     * @returns {Array}
     */
    getWaitingTimes: function () {
        var waitings = this.confData.waitingTimes;
        var ishaDate = this.getCurrentDateForPrayerTime(this.getIshaTime());
        if (this.confData.maximumIshaTimeForNoWaiting != null && this.confData.maximumIshaTimeForNoWaiting.matchTime()) {
            var maximumIshaTimeForNoWaitingDate = this.getCurrentDateForPrayerTime(this.confData.maximumIshaTimeForNoWaiting);
            if (ishaDate.getHours() === 0 || ishaDate >= maximumIshaTimeForNoWaitingDate) {
                waitings[4] = 0;
            }
        }
        return waitings;
    },
    /**
     * handle next prayer countdown
     */
    nextPrayerCountdown: function () {
        $(".next-prayer").show();
        var prayerDateTime, pattern;
        var date = new Date();
        // by default we countdwon the next day fajr
        var tomorrowFajrDate = prayer.getCurrentDateForPrayerTime(prayer.getTimeByIndex(0));
        tomorrowFajrDate.setDate(tomorrowFajrDate.getDate() + 1);
        var countDownDate = tomorrowFajrDate;

        $.each(prayer.getTimes(), function (index, time) {
            // handle jumua
            if (prayer.isJumua(index)) {
                time = prayer.getJumuaTime();
            }

            prayerDateTime = prayer.getCurrentDateForPrayerTime(time);

            if (prayerDateTime.getHours() !== 0 && date < prayerDateTime) {
                countDownDate = prayerDateTime;
                return false;
            }
        });

        $(".next-prayer .countdown").countdown(countDownDate, function (event) {
            pattern = '%H:%M';
            if (event.offset.hours === 0 && event.offset.minutes === 0) {
                pattern = '%H:%M:%S'
                if (event.offset.seconds === 0) {
                    $(".next-prayer").hide();
                    return;
                }
            }
            $(this).text(event.strftime(pattern));
        });
    },
    formatTime: function (time) {
        if (time) {
            var timeDisplayFormat = prayer.confData.timeDisplayFormat;
            return dateTime.formatTime(time, timeDisplayFormat);
        }
    },
    /**
     * Check conditions to apply dst for calendar mode
     * @param {Boolean} tomorrow
     * @return {boolean}
     */
    applyDstForCalendarMode: function (tomorrow) {
        if (prayer.confData.sourceCalcul === "calendar") {
            // dst = 2 => auto
            if (prayer.confData.dst === "auto") {
                return dateTime.isDst(tomorrow);
            }

            // dst = 1 => enabled
            if (prayer.confData.dst === 1 && prayer.confData.dstSummerDate && prayer.confData.dstWinterDate) {
                var dstSummerDate = (new Date(prayer.confData.dstSummerDate)).getTime();
                var dstWinterDate = (new Date(prayer.confData.dstWinterDate).getTime());
                var date = (new Date()).setHours(4);
                if (date > dstSummerDate && date < dstWinterDate) {
                    return true;
                }
            }
        }

        return false;
    },
    /**
     * +1|-1 hour on time for calendar times
     * Condition 1 : on calendar prayers
     * Condition 2 : if dst auto and we are between last sunday of march oand last sunday of october
     * Condition 3 : if dst enablded and we are in choosen dates
     * @param {Boolean} tomorrow
     * @param {String} time
     * @returns {String}
     */
    dstConvertTimeForCalendarMode: function (time, tomorrow) {
        if (this.applyDstForCalendarMode(tomorrow)) {
            var prayerdateTime = prayer.getCurrentDateForPrayerTime(time);
            prayerdateTime.setHours(prayerdateTime.getHours() + 1);
            return addZero(prayerdateTime.getHours()) + ':' + addZero(prayerdateTime.getMinutes());
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
    getIshaTime: function () {
        return this.getTimes()[4];
    },
    /**
     * get chourouk time
     * @returns {String}
     */
    getChouroukTime: function () {
        return prayer.dstConvertTimeForCalendarMode(this.times[2]);
    },
    /**
     * Get the imsak time calculated by soustraction of imsakNbMinBeforeFajr from sobh time
     * @returns {String}
     */
    getImsak: function () {
        var sobh = this.getTimeByIndex(0);
        var sobhDateTime = this.getCurrentDateForPrayerTime(sobh);
        var imsakDateTime = sobhDateTime.setMinutes(sobhDateTime.getMinutes() - this.confData.imsakNbMinBeforeFajr);
        imsakDateTime = new Date(imsakDateTime);
        return addZero(imsakDateTime.getHours()) + ':' + addZero(imsakDateTime.getMinutes());
    },
    /**
     * init the cron that change prayer times by day
     * at midnight we change prayer times for the day
     * we check every minute
     */
    initCronHandlingTimes: function () {
        var date;
        setInterval(function () {
            date = new Date();
            if (date.getHours() === 0 && date.getMinutes() === 0) {
                prayer.setDate();
                prayer.loadTimes();
                prayer.setTimes();
                prayer.initNextTimeHilight();
                prayer.setSpecialTimes();
            }
            prayer.showSpecialTimes();
        }, prayer.oneMinute);
    },
    /**
     * Reload page every day at 2 o'clock to prevent any graphical bug
     * Reload only if internet connection available
     */
    initCronReloadPage: function () {
        setInterval(function () {
            var date = new Date();
            if (date.getHours() === 2) {
                reloadIfConnected();
            }
        }, 60 * prayer.oneMinute);
    },
    /**
     * Check every second if iqama time is ok
     * if ok we show iqama flashing for 30 sec
     */
    iqama: {
        isFlashing: false,
        initFlash: function () {
            if (!prayer.confData.iqamaEnabled) {
                return;
            }
            setInterval(function () {
                if (!prayer.iqama.isFlashing) {
                    var currentDateForPrayerTime, diffTimeInMiniute, currentPrayerWaitingTime, date;
                    $(prayer.getTimes()).each(function (currentPrayerIndex, time) {

                        // if jumua and mosque type we don't flash iqama
                        if (prayer.isJumua(currentPrayerIndex) && prayer.isMosque) {
                            return;
                        }

                        date = new Date();
                        currentDateForPrayerTime = prayer.getCurrentDateForPrayerTime(time);

                        if (date.getHours() === 0 && currentDateForPrayerTime.getHours() === 23) {
                            currentDateForPrayerTime.setDate(currentDateForPrayerTime.getDate() - 1);
                        }

                        diffTimeInMiniute = Math.floor((date - currentDateForPrayerTime) / prayer.oneMinute);
                        currentPrayerWaitingTime = prayer.getWaitingByIndex(currentPrayerIndex);
                        if (diffTimeInMiniute === currentPrayerWaitingTime) {
                            prayer.iqama.isFlashing = true;
                            // iqama flashing
                            prayer.iqama.flash(currentPrayerIndex);
                        }
                    });
                }
            }, prayer.oneSecond);
        },
        /**
         * flash iqama for 30 sec
         * @param {Number} currentPrayerIndex
         */
        flash: function (currentPrayerIndex) {

            $(".main-iqama-countdown").addClass("hidden");
            $(".top-content .content").removeClass("hidden");

            prayer.switchLayer('main', 'iqama');

            // flash
            var iqamaFlashInterval = setInterval(function () {
                $(".iqama .image").toggleClass("hidden");
            }, prayer.oneSecond);

            // stop iqama flashing after defined time
            setTimeout(function () {
                prayer.iqama.stopFlashing(iqamaFlashInterval);
            }, prayer.confData.iqamaDisplayTime * prayer.oneSecond);

            // reset flag iqamaIsFlashing after one minute
            setTimeout(function () {
                prayer.iqama.isFlashing = false;
            }, prayer.oneMinute);

            // init douaa after prayer timeout
            setTimeout(function () {
                douaaSlider.show(currentPrayerIndex);
            }, prayer.confData.duaAfterPrayerShowTimes[currentPrayerIndex] * prayer.oneMinute);
        },
        stopFlashing: function (iqamaFlashInterval) {
            $(".iqama").fadeOut(500, function () {
                if (prayer.confData.blackScreenWhenPraying && !prayer.isMobile()) {
                    $("#black-screen").fadeIn(500);
                } else {
                    $(".main").fadeIn(500);
                }
            });
            clearInterval(iqamaFlashInterval);
        },
        /**
         * Set iqama countdonwn
         * @param {Number} currentPrayerIndex
         */
        countdown: function (currentPrayerIndex) {
            var time = prayer.getTimeByIndex(currentPrayerIndex);
            var waitingText = $(".wait._" + currentPrayerIndex).text();
            var prayerTimeDate = prayer.getCurrentDateForPrayerTime(time);
            var prayerTimePlusWaiting = prayerTimeDate.setMinutes(prayerTimeDate.getMinutes() + prayer.getWaitingByIndex(currentPrayerIndex));
            var currentElem = $(".wait._" + currentPrayerIndex);
            var countdown;
            $(currentElem).countdown(prayerTimePlusWaiting, function (event) {
                countdown = event.strftime('%M:%S');
                $('.main-iqama-countdown .countdown,' + ".mobile .wait._" + currentPrayerIndex).text(countdown);
                if (prayer.confData.iqamaFullScreenCountdown === false) {
                    $(this).text(countdown);
                }
            }).on('finish.countdown', function () {
                $(currentElem).text(waitingText);
            });
        }
    },
    /**
     * Check every minute if athan time is ok
     * if adhan time is ok we flash time
     * after one minute we stop flashing and show adhan douaa
     */
    adhan: {
        isFlashing: false,
        initFlash: function () {
            setInterval(function () {
                if (!prayer.adhan.isFlashing) {
                    var currentTime = dateTime.getCurrentTime()
                    $(prayer.getTimes()).each(function (currentPrayerIndex, time) {
                        if (time === currentTime) {
                            // if jumua and mosque type we don't flash adhan
                            if (prayer.isJumua(currentPrayerIndex) && prayer.isMosque) {
                                return;
                            }
                            prayer.adhan.isFlashing = true;
                            prayer.adhan.flash(currentPrayerIndex);
                        }
                    });
                }
            }, prayer.oneSecond);
        },
        /**
         * Flash adhan, play sound if enabled
         * @param {Number} currentPrayerIndex
         */
        flash: function (currentPrayerIndex) {
            if (prayer.confData.azanVoiceEnabled === true) {
                var file = "adhan-maquah.mp3";
                if (currentPrayerIndex === 0) {
                    var file = "adhan-maquah-fajr.mp3";
                }
                prayer.playSound(file);
            }

            // init next hilight timeout
            prayer.setNextTimeHilight(currentPrayerIndex);

            // iqama countdown
            if (prayer.confData.iqamaEnabled) {
                prayer.iqama.countdown(currentPrayerIndex);
            }

            $(".top-content .content").addClass("hidden");

            var adhanFlashInterval = setInterval(function () {
                $(".top-content .adhan-flash").toggleClass("hidden");
                $(".prayer-content .adhan" + currentPrayerIndex).toggleClass("hidden");
                $(".prayer-content .prayer" + currentPrayerIndex).toggleClass("hidden");
            }, prayer.oneSecond);

            setTimeout(function () {
                prayer.adhan.stopFlashing(adhanFlashInterval, currentPrayerIndex);
            }, prayer.getAdhanFlashingTime(currentPrayerIndex));
        },
        stopFlashing: function (adhanFlashInterval, currentPrayerIndex) {
            clearInterval(adhanFlashInterval);
            prayer.adhan.isFlashing = false;
            $(".top-content .adhan-flash").addClass("hidden");

            if (prayer.confData.iqamaEnabled && prayer.confData.iqamaFullScreenCountdown === true) {
                $(".main-iqama-countdown").removeClass("hidden");
            } else {
                $(".top-content .content").removeClass("hidden");
            }

            $(".prayer-content .adhan" + currentPrayerIndex).addClass("hidden");
            $(".prayer-content .prayer" + currentPrayerIndex).removeClass("hidden");
            prayer.duaAfterAdhan.handle(currentPrayerIndex);
        }
    },

    /**
     * cron for fajr waking up
     * @returns {undefined}
     */
    fajrWakeAdhanIsPlaying: false,
    initWakupFajr: function () {
        setInterval(function () {
            if (prayer.fajrWakeAdhanIsPlaying === false && parseInt(prayer.confData.wakeForFajrTime) > 0) {
                var date = new Date();
                var fajrTime = prayer.getTimeByIndex(0);
                var diffTimeInMiniute = Math.floor((date - prayer.getCurrentDateForPrayerTime(fajrTime)) / prayer.oneMinute);
                if (diffTimeInMiniute === -parseInt(prayer.confData.wakeForFajrTime)) {
                    var $contentEl = $(".top-content .content");
                    var $alarmFlashEl = $(".alarm-flash");

                    prayer.fajrWakeAdhanIsPlaying = true;
                    // play adhan sound
                    prayer.playSound(prayer.confData.wakeAzanVoice + ".mp3");
                    $contentEl.addClass("hidden");

                    // flash every one seconde
                    var interval = setInterval(function () {
                        $alarmFlashEl.toggleClass("hidden");
                    }, prayer.oneSecond);

                    // timeout to stop flashing
                    setTimeout(function () {
                        prayer.fajrWakeAdhanIsPlaying = false;
                        $contentEl.removeClass("hidden");
                        $alarmFlashEl.addClass("hidden");
                        clearInterval(interval);
                    }, 200 * prayer.oneSecond);
                }
            }
        }, prayer.oneMinute);
    },
    jumuaHandler: {
        /**
         * init cron
         */
        init: function () {
            if (prayer.confData.noJumua === false) {
                setInterval(function () {
                    var date = new Date();
                    if (date.getDay() === 5) {
                        var currentTime = dateTime.getCurrentTime(false);
                        // show reminder
                        if (currentTime === prayer.getJumuaTime()) {

                            // hilight asr
                            prayer.setNextTimeHilight(1);

                            if (prayer.confData.jumuaDhikrReminderEnabled === true) {
                                prayer.jumuaHandler.showReminder();
                                setTimeout(function () {
                                    prayer.jumuaHandler.hideReminder();
                                }, prayer.confData.jumuaTimeout * prayer.oneMinute);
                            } else if (prayer.confData.jumuaBlackScreenEnabled === true) {
                                prayer.jumuaHandler.showBlackScreen();
                                setTimeout(function () {
                                    prayer.jumuaHandler.hideBlackScreen();
                                }, prayer.confData.jumuaTimeout * prayer.oneMinute);
                            }
                        }
                    }
                }, prayer.oneMinute);
            }
        },
        showReminder: function () {
            fixFontSize('.jumua-dhikr-reminder');
            $(".main").fadeOut(500, function () {
                $(".jumua-dhikr-reminder").fadeIn(500);
            });
        },
        hideReminder: function () {
            $(".jumua-dhikr-reminder").fadeOut(500, function () {
                $(".main").fadeIn(500, function () {
                    messageInfoSlider.get();
                });
            });
        },
        showBlackScreen: function () {
            $(".main").fadeOut(500);
        },
        hideBlackScreen: function () {
            $(".main").fadeIn(500, function () {
                messageInfoSlider.get();
            });
        }
    },
    /**
     *  timeout for stopping time flashing
     *  @param {integer} currentPrayerIndex
     */
    getAdhanFlashingTime: function (currentPrayerIndex) {

        // if short waiting
        if (prayer.getWaitingByIndex(currentPrayerIndex) === 2) {
            return prayer.oneSecond * 90;
        }

        // if azan enablded
        if (prayer.confData.azanVoiceEnabled === true) {
            // if fajr
            if (currentPrayerIndex === 0) {
                return prayer.oneSecond * 250;
            }
            return prayer.oneSecond * 200;
        }

        // otherwise
        return prayer.oneSecond * 150;
    },
    /**
     * @param layerToHide the element class to hide
     * @param layerToShow the element class to show
     */
    switchLayer: function (layerToHide, layerToShow, correctFontSize) {
        if (correctFontSize === true) {
            fixFontSize('.' + layerToShow);
        }
        $('.' + layerToHide).fadeOut(500, function () {
            $('.' + layerToShow).fadeIn(500);
        });
    },
    /**
     * @return boolean
     */
    isMobile: function () {
        // The black screen element dos not exist in mobile view
        return $("#black-screen").length === 0;
    },
    /**
     * Play a bip
     */
    playSound: function (file) {
        var audio = new Audio('/static/mp3/' + file);
        audio.play();
    },
    /**
     * search and set the next prayer time hilight
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
            if (prayerDateTime.getHours() !== 0 && date > prayerDateTime) {
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
        $(".prayer-hilighted").removeClass("prayer-hilighted");
        $(".text-hilighted").removeClass("text-hilighted");

        // if joumouaa we hilight joumouaa time
        if (prayer.isJumua(prayerIndex)) {
            $(".joumouaa > div").addClass("text-hilighted");
            $(".joumouaa .prayer").addClass("prayer-hilighted");
            if (prayer.isMosque) {
                return;
            }
        }

        $(".prayer-text ._" + prayerIndex).addClass("text-hilighted");
        $(".prayer-wait ._" + prayerIndex).addClass("text-hilighted");
        $(".prayer-time ._" + prayerIndex).addClass("prayer-hilighted");
        $(".prayer.prayer" + prayerIndex).addClass("prayer-hilighted");
    },
    /**
     * 10 minute after current iqama we hilight the next prayer time
     * @param {int} currentTimeIndex
     */
    setNextTimeHilight: function (currentTimeIndex) {
        var nextTimeIndex = currentTimeIndex + 1;
        // if icha is the current prayer
        if (nextTimeIndex === 5) {
            nextTimeIndex = 0;
        }
        setTimeout(function () {
            prayer.hilightByIndex(nextTimeIndex);
            prayer.nextPrayerCountdown();
            // if ichaa we load tomorrow times
            var date = new Date();
            if (nextTimeIndex === 0 && date.getHours() !== 0) {
                prayer.loadTimes(true);
                prayer.setTimes(true);
            }
        }, prayer.nextPrayerHilightWait * prayer.oneMinute);
    },
    duaAfterAdhan: {
        showAdhanDua: function () {
            prayer.switchLayer('main', 'adhan', true);
        },
        hideAdhanDua: function () {
            prayer.switchLayer('adhan', 'main');
        },
        showHadith: function () {
            prayer.switchLayer('main', 'douaa-between-adhan-iqama', true);
        },
        hideHadith: function () {
            prayer.switchLayer('douaa-between-adhan-iqama', 'main');
        },
        /**
         * @param integer currentPrayerIndex
         * show douaa after adhan flash finish
         * show douaa for configured time
         * show hadith to remeber importance of douaa between adhan and iqama
         */
        handle: function (currentPrayerIndex) {
            if (prayer.confData.duaAfterAzanEnabled === true) {
                var iqamaWaiting = prayer.getWaitingByIndex(currentPrayerIndex);
                prayer.duaAfterAdhan.showAdhanDua();
                setTimeout(function () {
                    prayer.duaAfterAdhan.hideAdhanDua();
                    if (iqamaWaiting > 2) {
                        // show hadith between adhan and iqama
                        setTimeout(function () {
                            prayer.duaAfterAdhan.showHadith();
                            setTimeout(function () {
                                prayer.duaAfterAdhan.hideHadith();
                            }, 30 * prayer.oneSecond);
                        }, 10 * prayer.oneSecond);
                    }
                }, (iqamaWaiting > 2 ? 30 : 20) * prayer.oneSecond);
            }
        }
    },
    /**
     * set time every second
     */
    setTime: function () {
        var time, timeWithoutSec;
        var timeEl = $(".top-content .time");
        var timeBottomEl = $(".time-bottom");
        time = dateTime.getCurrentTime(true);
        timeWithoutSec = prayer.formatTime(dateTime.getCurrentTime());
        timeEl.html(prayer.formatTime(time));
        timeBottomEl.html(timeWithoutSec);
    },
    setTimeInterval: function () {
        setInterval(function () {
            prayer.setTime();
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
            var hijriAdjustment = prayer.confData.hijriAdjustment;
            $(".hijriDate span").text(writeIslamicDate(hijriAdjustment, lang));
            var hijriDate = kuwaiticalendar(hijriAdjustment);
            $(".hijriDate span").removeClass("white-days");
            $(".hijriDate img").addClass("hidden");
            if ($.inArray(hijriDate[5], [13, 14, 15]) !== -1) {
                $(".hijriDate span").addClass("white-days");
                $(".hijriDate img").removeClass("hidden");
            }
        }
    },
    /**
     * get jumu`a time depending dst
     * @returns {String}
     */
    getJumuaTime: function () {
        if (this.confData.jumuaAsDuhr === true) {
            // return duhr
            return this.getTimeByIndex(1);
        }
        if (this.confData.jumuaTime) {
            return this.confData.jumuaTime;
        }
        return dateTime.isDst() ? "14:00" : "13:00";
    },
    /**
     * if current time is joumouaa
     * @param {int} currentPrayerIndex
     * @returns {boolean}
     */
    isJumua: function (currentPrayerIndex) {
        var date = new Date();
        return prayer.confData.noJumua === false && date.getDay() === 5 && currentPrayerIndex === 1;
    },
    /**
     * check if jumua moment
     * @return {boolean}
     */
    isJumuaMoment: function () {
        var date = new Date();

        if (prayer.confData.noJumua) {
            return false;
        }

        if (date.getDay() !== 5) {
            return false;
        }

        var beginDateTime = prayer.getCurrentDateForPrayerTime(prayer.confData.jumuaTime);
        var beginTime = beginDateTime.getTime();
        var endTime = beginDateTime.setMinutes(beginDateTime.getMinutes() + prayer.confData.jumuaTimeout);

        if (date.getTime() < beginTime || date.getTime() > endTime) {
            return false;
        }

        return true;
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
        return index;
    },
    /**
     * handle custom time display
     */
    showSpecialTimes: function () {

        $(".custom-time").hide();
        // if aid time enabled we set/show it
        if (this.confData.aidTime && this.aidIsCommingSoon()) {
            $(".aid").show();
            return;
        }

        // if imsak disabled => show shuruq
        if (parseInt(this.confData.imsakNbMinBeforeFajr) === 0) {
            $(".chourouk").show();
            return;
        }

        // if imsak time enabled we show it between chourouk + 1 hour and sobh
        if (parseInt(this.confData.imsakNbMinBeforeFajr) !== 0) {
            var date = new Date();
            var midnight = new Date();
            midnight.setHours(0);
            midnight.setMinutes(0);
            midnight.setSeconds(0);
            var sobhDate = prayer.getCurrentDateForPrayerTime(prayer.getTimeByIndex(0));
            // if time betwwen midnight and sobh => show imsak
            if (date < sobhDate && date > midnight) {
                $(".imsak").show();
                return;
            }

            var chouroukDate = prayer.getCurrentDateForPrayerTime(prayer.getChouroukTime());
            chouroukDate = chouroukDate.setHours(chouroukDate.getHours() + 1);
            // if time > chourouk + 1 hour => show imsak
            if (date.getTime() > chouroukDate) {
                $(".imsak").show();
                if (this.isRamadan()) {
                    $(".imsak-id").addClass('important');
                }
                return;
            }
        }

        $(".chourouk").show();
    },
    setSpecialTimes: function () {
        // jumua
        $(".joumouaa-id").html(prayer.formatTime(this.getJumuaTime()));
        $(".joumouaa2-id > span").text(prayer.formatTime(prayer.confData.jumuaTime2));

        // if aid time enabled we set/show it
        $(".aid-id").html(prayer.formatTime(this.confData.aidTime));

        // set chourouk time
        $(".chourouk-id").html(prayer.formatTime(this.getChouroukTime()));

        // if imsak time enabled we show it between chourouk + 1 hour and sobh
        $(".imsak-id").html(prayer.formatTime(this.getImsak()));
    },
    /**
     * set all prayer times
     * @param {Boolean} tomorrow
     */
    setTimes: function (tomorrow) {
        var sobh = prayer.formatTime(this.getTimes(tomorrow)[0]);
        var dohr = prayer.formatTime(this.getTimes(tomorrow)[1]);
        var asr = prayer.formatTime(this.getTimes(tomorrow)[2]);
        var maghrib = prayer.formatTime(this.getTimes(tomorrow)[3]);
        var ichaa = prayer.formatTime(this.getTimes(tomorrow)[4]);

        $(".sobh").html(sobh);
        $(".dohr").html(dohr);
        $(".asr").html(asr);
        $(".maghrib").html(maghrib);
        $(".ichaa").html(ichaa);
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
        setTimeout(function () {
            $("#spinner").fadeOut(500, function () {
                $(".main").fadeIn(100);
            });
        }, 2000);
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

            $(".top-content .header").css("font-size", "650%");
            $(".top-content .content .ar").css("font-size", "120%");
            $(".prayer-text").css("line-height", "160%");
        }
    },
    /**
     * Init events
     */
    initEvents: function () {
        $(".version").click(function () {
            prayer.test();
        });
    },
    /**
     * Check if we are in praying moment (10 min before afhan and and 20 min after iqamah)
     */
    isPrayingMoment: function () {
        var isPrayingMoment = false;
        var date = new Date();
        var beginDateTime, endDateTime, prayerDateTime;
        $(prayer.getTimes()).each(function (i, time) {
            prayerDateTime = prayer.getCurrentDateForPrayerTime(time);
            beginDateTime = prayerDateTime.setMinutes(prayerDateTime.getMinutes() - 10);
            endDateTime = prayerDateTime.setMinutes(prayerDateTime.getMinutes() + prayer.getWaitingByIndex(i) + 20);
            if (date > beginDateTime && date < endDateTime) {
                isPrayingMoment = true;
                return false;
            }
        });

        return isPrayingMoment;
    },
    /**
     * Set QR code
     */
    setQRCode: function () {
        if (prayer.confData.urlQrCodeEnabled === true) {
            new QRCode("qr-code", {
                text: $(".qr-code").data("url"),
                width: 100,
                height: 100
            });
        }
    },
    isRamadan: function () {
        var hijriDateInfo = kuwaiticalendar(prayer.confData.hijriAdjustment);
        if (hijriDateInfo[6] === 8) {
            return true;
        }
        return false;
    },
    /**
     * Return true if aid is comming soon, 3 days before aid
     * @returns {boolean}
     */
    aidIsCommingSoon: function () {
        var hijriDateInfo = kuwaiticalendar(prayer.confData.hijriAdjustment);
        // if aid al-fitr
        if (hijriDateInfo[6] === 8 && hijriDateInfo[5] >= 27 && hijriDateInfo[5] <= 30) {
            return true;
        }
        if (hijriDateInfo[6] === 9 && hijriDateInfo[5] === 1) {
            return true;
        }

        // if aid al-adha
        if (hijriDateInfo[6] === 11 && hijriDateInfo[5] >= 7 && hijriDateInfo[5] <= 10) {
            return true;
        }
        return false;
    },
    /**
     * Test main app features
     */
    test: function () {
        // show douaa after prayer
        douaaSlider.oneDouaaShowingTime = 2000;
        douaaSlider.show(0);
        setTimeout(function () {
            // show douaa after adhan
            prayer.duaAfterAdhan.showAdhanDua();
            setTimeout(function () {
                prayer.duaAfterAdhan.hideAdhanDua();
            }, 3000);
            setTimeout(function () {
                //show hadith between adhan and iqama
                prayer.duaAfterAdhan.showHadith();
                setTimeout(function () {
                    prayer.duaAfterAdhan.hideHadith();
                    prayer.jumuaHandler.showReminder();
                    setTimeout(function () {
                        prayer.jumuaHandler.hideReminder();
                        randomHadith.get();
                        setTimeout(function () {
                            randomHadith.hide();
                            prayer.adhan.flash(2);
                            setTimeout(function () {
                                prayer.adhan.stopFlashing();
                                // flash iqama
                                prayer.confData.iqamaDisplayTime = 5;
                                prayer.iqama.flash(4);
                                // flash adhan
                                setTimeout(function () {
                                    location.reload();
                                }, 5000);
                            }, 5000);
                        }, 5000);
                    }, 5000);
                }, 5000);
            }, 5000);
        }, douaaSlider.getTimeForShow() + 3000);
    }
};