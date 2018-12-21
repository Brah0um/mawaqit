<?php

namespace AppBundle\Entity;

/**
 * Configuration
 */
class Configuration
{

    const SOURCE_API = 'api';
    const SOURCE_CALENDAR = 'calendar';
    const SOURCE_CHOICES = [
        self::SOURCE_API,
        self::SOURCE_CALENDAR
    ];
    const HADITH_LANG = [
        "ar", "en", "fr", "tr", "en-ar", "fr-ar", "tr-ar"
    ];

    const ASR_METHOD_CHOICES = [
        "Standard", "Hanafi"
    ];

    const HIGH_LATS_CHOICES = [
        "AngleBased", "NightMiddle", "OneSeventh"
    ];

    const METHOD_ISNA = 'ISNA';
    const METHOD_UOIF = 'UOIF';
    const METHOD_Karachi = 'Karachi';
    const METHOD_MWL = 'MWL';
    const METHOD_Makkah = 'Makkah';
    const METHOD_Egypt = 'Egypt';
    const METHOD_CUSTOM = 'CUSTOM';
    const METHOD_CHOICES = [
        self::METHOD_ISNA,
        self::METHOD_UOIF,
        self::METHOD_Karachi,
        self::METHOD_MWL,
        self::METHOD_Makkah,
        self::METHOD_Egypt,
        self::METHOD_CUSTOM,
    ];

    /**
     * @var int
     */
    private $id;

    /**
     * @var string
     */
    private $jumuaTime = "13:30";

    /**
     * @var string
     */
    private $jumuaTime2;

    /**
     * @var boolean
     */
    private $jumuaAsDuhr = false;

    /**
     * @var boolean
     */
    private $noJumua = false;

    /**
     * @var boolean
     */
    private $jumuaDhikrReminderEnabled = true;

    /**
     * @var boolean
     */
    private $jumuaBlackScreenEnabled = false;

    /**
     * @var integer
     */
    private $jumuaTimeout = 30;

    /**
     * @var string
     */
    private $aidTime;

    /**
     * @var int
     */
    private $imsakNbMinBeforeFajr = 0;

    /**
     * @var string
     */
    private $maximumIshaTimeForNoWaiting;

    /**
     * @var array
     */
    private $waitingTimes = [10, 10, 10, 5, 10];

    /**
     * @var array
     */
    private $adjustedTimes = [0, 0, 0, 0, 0];

    /**
     * @var array
     */
    private $fixedTimes = ["", "", "", "", ""];

    /**
     * @var array
     */
    private $duaAfterPrayerShowTimes = [9, 8, 8, 8, 9];

    /**
     * @var int
     */
    private $hijriAdjustment = 0;

    /**
     * @var bool
     */
    private $hijriDateEnabled = true;

    /**
     * @var bool
     */
    private $duaAfterAzanEnabled = true;

    /**
     * @var bool
     */
    private $duaAfterPrayerEnabled = true;

    /**
     * @var bool
     */
    private $azanVoiceEnabled = false;

    /**
     * @var string
     */
    private $wakeAzanVoice = "adhan-maquah";

    /**
     * @var bool
     */
    private $iqamaFullScreenCountdown = true;

    /**
     * @var bool
     */
    private $blackScreenWhenPraying = true;

    /**
     * @var bool
     */
    private $urlQrCodeEnabled = true;

    /**
     * @var string
     */
    private $sourceCalcul = self::SOURCE_API;

    /**
     * @var string
     */
    private $prayerMethod = 'ISNA';

    /**
     * @var string
     */
    private $asrMethod = 'Standard';

    /**
     * @var string
     */
    private $highLatsMethod = 'AngleBased';

    /**
     * @var integer
     */
    private $timezone = 1;

    /**
     * @var integer
     * default to 2 = auto
     * possible values 0 (disabled), 1 (enabled), 2 (auto)
     */
    private $dst = 2;

    /**
     * DateTime
     */
    private $dstSummerDate;

    /**
     * DateTime
     */
    private $dstWinterDate;

    /**
     * @var int
     */
    private $fajrDegree;

    /**
     * @var int
     */
    private $ishaDegree;

    /**
     * @var int
     */
    private $iqamaDisplayTime = 30;

    /**
     * @var string
     */
    private $site;

    /**
     * @var array
     */
    private $calendar = [];

    /**
     * @var \DateTime
     */
    private $created;

    /**
     * @var \DateTime
     */
    private $updated;

    /**
     * @var bool
     */
    private $smallScreen = false;

    /**
     * @var bool
     */
    private $randomHadithEnabled = true;

    /**
     * Interval (exception) for disabling hadith between 2 prayers
     * @var string
     */
    private $randomHadithIntervalDisabling;

    /**
     * @var bool
     */
    private $temperatureEnabled = true;

    /**
     * @var string
     */
    private $backgroundColor = "#000000";

    /**
     * @var string
     */
    private $hadithLang = "ar";

    /**
     * @var integer
     */
    private $wakeForFajrTime;

    /**
     * time in second
     * @var integer
     */
    private $timeToDisplayMessage = 30;

    /**
     * @var bool
     */
    private $iqamaEnabled = true;

    /**
     * @var string
     */
    private $ishaFixation;

    /**
     * @var bool
     */
    private $footer = true;

    /**
     * @var string
     */
    private $backgroundType = "motif";

    /**
     * @var string
     */
    private $backgroundMotif = "1";

    /**
     * @var string
     */
    private $timeDisplayFormat = "24";

    /**
     * @var bool
     */
    private $showNextAdhanCountdown = true;

    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }


    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * Set jumuaTime
     *
     * @param string $jumuaTime
     *
     * @return Configuration
     */
    public function setJumuaTime($jumuaTime)
    {
        $this->jumuaTime = $jumuaTime;

        return $this;
    }

    /**
     * Get jumuaTime
     *
     * @return string
     */
    public function getJumuaTime()
    {
        return $this->jumuaTime;
    }

    /**
     * @return string
     */
    public function getJumuaTime2()
    {
        return $this->jumuaTime2;
    }

    /**
     * @param string $jumuaTime2
     */
    public function setJumuaTime2($jumuaTime2): void
    {
        $this->jumuaTime2 = $jumuaTime2;
    }


    function isJumuaAsDuhr()
    {
        return $this->jumuaAsDuhr;
    }

    function setJumuaAsDuhr($jumuaAsDuhr)
    {
        $this->jumuaAsDuhr = $jumuaAsDuhr;
    }

    /**
     * Set aidTime
     *
     * @param string $aidTime
     *
     * @return Configuration
     */
    public function setAidTime($aidTime)
    {
        $this->aidTime = $aidTime;

        return $this;
    }

    /**
     * Get aidTime
     *
     * @return string
     */
    public function getAidTime()
    {
        return $this->aidTime;
    }

    /**
     * Set imsakNbMinBeforeFajr
     *
     * @param integer $imsakNbMinBeforeFajr
     *
     * @return Configuration
     */
    public function setImsakNbMinBeforeFajr($imsakNbMinBeforeFajr)
    {
        $this->imsakNbMinBeforeFajr = $imsakNbMinBeforeFajr;

        return $this;
    }

    /**
     * Get imsakNbMinBeforeFajr
     *
     * @return int
     */
    public function getImsakNbMinBeforeFajr()
    {
        return $this->imsakNbMinBeforeFajr;
    }

    /**
     * Set maximumIshaTimeForNoWaiting
     *
     * @param string $maximumIshaTimeForNoWaiting
     *
     * @return Configuration
     */
    public function setMaximumIshaTimeForNoWaiting($maximumIshaTimeForNoWaiting)
    {
        $this->maximumIshaTimeForNoWaiting = $maximumIshaTimeForNoWaiting;

        return $this;
    }

    /**
     * Get maximumIshaTimeForNoWaiting
     *
     * @return \DateTime
     */
    public function getMaximumIshaTimeForNoWaiting()
    {
        return $this->maximumIshaTimeForNoWaiting;
    }

    /**
     * Set waitingTimes
     *
     * @param array $waitingTimes
     *
     * @return Configuration
     */
    public function setWaitingTimes($waitingTimes)
    {
        $this->waitingTimes = $waitingTimes;

        return $this;
    }

    /**
     * Get waitingTimes
     *
     * @return array
     */
    public function getWaitingTimes()
    {
        return array_map(function ($value) {
            return (int)$value;
        }, $this->waitingTimes);
    }

    /**
     * Set prayerTimesAdjustment
     *
     * @param array $adjustedTimes
     *
     * @return Configuration
     */
    public function setAdjustedTimes($adjustedTimes)
    {
        $this->adjustedTimes = $adjustedTimes;

        return $this;
    }

    /**
     * Get adjustedTimes
     *
     * @return array
     */
    public function getAdjustedTimes()
    {
        return $this->adjustedTimes;
    }

    /**
     * Set prayerTimesFixing
     *
     * @param array $fixedTimes
     *
     * @return Configuration
     */
    public function setFixedTimes($fixedTimes)
    {
        $this->fixedTimes = $fixedTimes;

        return $this;
    }

    /**
     * Get fixedTimes
     *
     * @return array
     */
    public function getFixedTimes()
    {
        return $this->fixedTimes;
    }

    /**
     * Set duaAfterPrayerShowTimes
     *
     * @param array $duaAfterPrayerShowTimes
     *
     * @return Configuration
     */
    public function setDuaAfterPrayerShowTimes($duaAfterPrayerShowTimes)
    {
        $this->duaAfterPrayerShowTimes = $duaAfterPrayerShowTimes;

        return $this;
    }

    /**
     * Get duaAfterPrayerShowTimes
     *
     * @return array
     */
    public function getDuaAfterPrayerShowTimes()
    {
        return $this->duaAfterPrayerShowTimes;
    }

    /**
     * Set hijriAdjustment
     *
     * @param integer $hijriAdjustment
     *
     * @return Configuration
     */
    public function setHijriAdjustment($hijriAdjustment)
    {
        $this->hijriAdjustment = $hijriAdjustment;

        return $this;
    }

    /**
     * Get hijriAdjustment
     *
     * @return int
     */
    public function getHijriAdjustment()
    {
        return $this->hijriAdjustment;
    }

    /**
     * Set hijriDateEnabled
     *
     * @param boolean $hijriDateEnabled
     *
     * @return Configuration
     */
    public function setHijriDateEnabled($hijriDateEnabled)
    {
        $this->hijriDateEnabled = $hijriDateEnabled;

        return $this;
    }

    /**
     * Get hijriDateEnabled
     *
     * @return bool
     */
    public function getHijriDateEnabled()
    {
        return $this->hijriDateEnabled;
    }

    /**
     * Set duaAfterAzanEnabled
     *
     * @param boolean $duaAfterAzanEnabled
     *
     * @return Configuration
     */
    public function setDuaAfterAzanEnabled($duaAftertdhanEnabled)
    {
        $this->duaAfterAzanEnabled = $duaAftertdhanEnabled;

        return $this;
    }

    /**
     * Get duaAfterAzanEnabled
     *
     * @return bool
     */
    public function getDuaAfterAzanEnabled()
    {
        return $this->duaAfterAzanEnabled;
    }

    /**
     * Set duaAfterPrayerEnabled
     *
     * @param boolean $duaAfterPrayerEnabled
     *
     * @return Configuration
     */
    public function setDuaAfterPrayerEnabled($duaAfterPrayerEnabled)
    {
        $this->duaAfterPrayerEnabled = $duaAfterPrayerEnabled;

        return $this;
    }

    /**
     * Get douaaAfterPrayerEnabled
     *
     * @return bool
     */
    public function getDuaAfterPrayerEnabled()
    {
        return $this->duaAfterPrayerEnabled;
    }

    /**
     * Set urlQrCodeEnabled
     *
     * @param boolean $urlQrCodeEnabled
     *
     * @return Configuration
     */
    public function setUrlQrCodeEnabled($urlQrCodeEnabled)
    {
        $this->urlQrCodeEnabled = $urlQrCodeEnabled;

        return $this;
    }

    /**
     * Get urlQrCodeEnabled
     *
     * @return bool
     */
    public function getUrlQrCodeEnabled()
    {
        return $this->urlQrCodeEnabled;
    }

    /**
     * Set sourceCalcul
     *
     * @param string $sourceCalcul
     *
     * @return Configuration
     */
    public function setSourceCalcul($sourceCalcul)
    {
        $this->sourceCalcul = $sourceCalcul;

        return $this;
    }

    /**
     * Get sourceCalcul
     *
     * @return string
     */
    public function getSourceCalcul()
    {
        return $this->sourceCalcul;
    }

    /**
     * Set prayerMethod
     *
     * @param string $prayerMethod
     *
     * @return Configuration
     */
    public function setPrayerMethod($prayerMethod)
    {
        $this->prayerMethod = $prayerMethod;

        return $this;
    }

    function getTimezone()
    {
        return $this->timezone;
    }

    function setTimezone($timezone)
    {
        $this->timezone = $timezone;
    }

    function getDst()
    {
        return $this->dst === 2 ? "auto" : $this->dst;
    }

    function setDst($dst)
    {
        $this->dst = $dst;
    }

    /**
     * Get prayerMethod
     *
     * @return string
     */
    public function getPrayerMethod()
    {
        return $this->prayerMethod;
    }

    /**
     * Set fajrDegree
     *
     * @param integer $fajrDegree
     *
     * @return Configuration
     */
    public function setFajrDegree($fajrDegree)
    {
        $this->fajrDegree = $fajrDegree;

        return $this;
    }

    /**
     * Get fajrDegree
     *
     * @return int
     */
    public function getFajrDegree()
    {
        return $this->fajrDegree;
    }

    /**
     * Set ishaDegree
     *
     * @param integer $ishaDegree
     *
     * @return Configuration
     */
    public function setIshaDegree($ishaDegree)
    {
        $this->ishaDegree = $ishaDegree;

        return $this;
    }

    /**
     * Get ishaDegree
     *
     * @return int
     */
    public function getIshaDegree()
    {
        return $this->ishaDegree;
    }

    /**
     * Set iqamaDisplayTime
     *
     * @param integer $iqamaDisplayTime
     *
     * @return Configuration
     */
    public function setIqamaDisplayTime($iqamaDisplayTime)
    {
        $this->iqamaDisplayTime = $iqamaDisplayTime;

        return $this;
    }

    /**
     * Get iqamaDisplayTime
     *
     * @return int
     */
    public function getIqamaDisplayTime()
    {
        return $this->iqamaDisplayTime;
    }

    /**
     * Set site
     *
     * @param string $site
     *
     * @return Configuration
     */
    public function setSite($site)
    {
        $this->site = $site;

        return $this;
    }

    /**
     * Get site
     *
     * @return string
     */
    public function getSite()
    {
        return $this->site;
    }

    /**
     * Set calendar
     *
     * @param string $calendar
     *
     * @return Configuration
     */
    public function setCalendar($calendar)
    {
        $this->calendar = $calendar;

        return $this;
    }

    /**
     * Get calendar
     *
     * @return array
     */
    public function getCalendar(): array
    {
        return $this->calendar;
    }

    /**
     * Set created
     *
     * @param \DateTime $created
     *
     * @return Configuration
     */
    public function setCreated($created)
    {
        $this->created = $created;

        return $this;
    }

    /**
     * Get created
     *
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * Set updated
     *
     * @param string $updated
     *
     * @return Configuration
     */
    public function setUpdated($updated)
    {
        $this->updated = $updated;

        return $this;
    }

    /**
     * Get updated
     *
     * @return string
     */
    public function getUpdated()
    {
        return $this->updated;
    }

    function isAzanVoiceEnabled()
    {
        return $this->azanVoiceEnabled;
    }

    function setAzanVoiceEnabled($azanVoiceEnabled)
    {
        $this->azanVoiceEnabled = $azanVoiceEnabled;
    }

    function isCalendar()
    {
        return $this->sourceCalcul === self::SOURCE_CALENDAR;
    }

    function isApi()
    {
        return $this->sourceCalcul === self::SOURCE_API;
    }

    /**
     * @return boolean
     */
    function getSmallScreen()
    {
        return $this->smallScreen;
    }

    function setSmallScreen($smallScreen)
    {
        $this->smallScreen = $smallScreen;
    }

    /**
     * @return string
     */
    function getBackgroundColor()
    {
        return $this->backgroundColor;
    }

    function setBackgroundColor($backgroundColor)
    {
        $this->backgroundColor = $backgroundColor;
    }

    function isNoJumua()
    {
        return $this->noJumua;
    }

    function setNoJumua($noJumua)
    {
        $this->noJumua = $noJumua;
    }

    function isJumuaDhikrReminderEnabled()
    {
        return $this->jumuaDhikrReminderEnabled;
    }

    function getJumuaTimeout()
    {
        return $this->jumuaTimeout;
    }

    function setJumuaDhikrReminderEnabled($jumuaDhikrReminderEnabled)
    {
        $this->jumuaDhikrReminderEnabled = $jumuaDhikrReminderEnabled;
    }

    function setJumuaTimeout($jumuaTimeout)
    {
        $this->jumuaTimeout = $jumuaTimeout;
    }

    function isRandomHadithEnabled()
    {
        return $this->randomHadithEnabled;
    }

    function setRandomHadithEnabled($randomHadithEnabled)
    {
        $this->randomHadithEnabled = $randomHadithEnabled;
    }

    function isBlackScreenWhenPraying()
    {
        return $this->blackScreenWhenPraying;
    }

    function setBlackScreenWhenPraying($blackScreenWhenPraying)
    {
        $this->blackScreenWhenPraying = $blackScreenWhenPraying;
    }

    function getWakeForFajrTime()
    {
        return $this->wakeForFajrTime;
    }

    function setWakeForFajrTime($wakeForFajrTime)
    {
        $this->wakeForFajrTime = $wakeForFajrTime;
    }

    function isJumuaBlackScreenEnabled()
    {
        return $this->jumuaBlackScreenEnabled;
    }

    function setJumuaBlackScreenEnabled($jumuaBalckScreenEnabled)
    {
        $this->jumuaBlackScreenEnabled = $jumuaBalckScreenEnabled;
    }

    function isTemperatureEnabled()
    {
        return $this->temperatureEnabled;
    }

    function setTemperatureEnabled($temperatureEnabled)
    {
        $this->temperatureEnabled = $temperatureEnabled;
    }

    function getHadithLang()
    {
        return $this->hadithLang;
    }

    function setHadithLang($hadithLang)
    {
        $this->hadithLang = $hadithLang;
    }

    public static function getHadithLangs()
    {
        return self::HADITH_LANG;
    }

    function getTimeToDisplayMessage()
    {
        return $this->timeToDisplayMessage;
    }

    function setTimeToDisplayMessage($timeToDisplayMessage)
    {
        $this->timeToDisplayMessage = $timeToDisplayMessage;
    }

    /**
     * @return bool
     */
    public function isIqamaEnabled()
    {
        return $this->iqamaEnabled;
    }

    /**
     * @param bool $iqamaEnabled
     * @return Configuration
     */
    public function setIqamaEnabled($iqamaEnabled)
    {
        $this->iqamaEnabled = $iqamaEnabled;
        return $this;
    }

    /**
     * @return string
     */
    public function getRandomHadithIntervalDisabling()
    {
        return $this->randomHadithIntervalDisabling;
    }

    /**
     * @param string $randomHadithIntervalDisabling
     */
    public function setRandomHadithIntervalDisabling($randomHadithIntervalDisabling)
    {
        $this->randomHadithIntervalDisabling = $randomHadithIntervalDisabling;
    }

    /**
     * @return string
     */
    public function getIshaFixation()
    {
        return $this->ishaFixation;
    }

    /**
     * @param string $ishaFixation
     * @return Configuration
     */
    public function setIshaFixation($ishaFixation)
    {
        $this->ishaFixation = $ishaFixation;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDstSummerDate()
    {
        return $this->dstSummerDate;
    }

    /**
     * @param mixed $dstSummerDate
     * @return Configuration
     */
    public function setDstSummerDate($dstSummerDate)
    {
        $this->dstSummerDate = $dstSummerDate;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getDstWinterDate()
    {
        return $this->dstWinterDate;
    }

    /**
     * @param mixed $dstWinterDate
     * @return Configuration
     */
    public function setDstWinterDate($dstWinterDate)
    {
        $this->dstWinterDate = $dstWinterDate;
        return $this;
    }

    /**
     * @return string
     */
    public function getWakeAzanVoice()
    {
        return $this->wakeAzanVoice;
    }

    /**
     * @param string $wakeAzanVoice
     * @return Configuration
     */
    public function setWakeAzanVoice($wakeAzanVoice)
    {
        $this->wakeAzanVoice = $wakeAzanVoice;
        return $this;
    }

    /**
     * @return bool
     */
    public function isFooter()
    {
        return $this->footer;
    }

    /**
     * @param bool $footer
     * @return Configuration
     */
    public function setFooter($footer)
    {
        $this->footer = $footer;
        return $this;
    }

    /**
     * @return string
     */
    public function getTimeDisplayFormat()
    {
        return $this->timeDisplayFormat;
    }

    /**
     * @param string $timeDisplayFormat
     */
    public function setTimeDisplayFormat($timeDisplayFormat)
    {
        $this->timeDisplayFormat = $timeDisplayFormat;
    }

    /**
     * @return bool
     */
    public function isShowNextAdhanCountdown()
    {
        return $this->showNextAdhanCountdown;
    }

    /**
     * @param bool $showNextAdhanCountdown
     * @return Configuration
     */
    public function setShowNextAdhanCountdown($showNextAdhanCountdown)
    {
        $this->showNextAdhanCountdown = $showNextAdhanCountdown;
        return $this;
    }

    /**
     * @return string
     */
    public function getBackgroundType()
    {
        return $this->backgroundType;
    }

    /**
     * @param string $backgroundType
     * @return Configuration
     */
    public function setBackgroundType($backgroundType)
    {
        $this->backgroundType = $backgroundType;
        return $this;
    }

    /**
     * @return string
     */
    public function getBackgroundMotif(): string
    {
        return $this->backgroundMotif;
    }

    /**
     * @param string $backgroundMotif
     * @return Configuration
     */
    public function setBackgroundMotif(string $backgroundMotif): Configuration
    {
        $this->backgroundMotif = $backgroundMotif;
        return $this;
    }

    /**
     * @return string
     */
    public function getAsrMethod(): string
    {
        return $this->asrMethod;
    }

    /**
     * @param string $asrMethod
     * @return Configuration
     */
    public function setAsrMethod(string $asrMethod): Configuration
    {
        $this->asrMethod = $asrMethod;
        return $this;
    }

    /**
     * @return string
     */
    public function getHighLatsMethod()
    {
        return $this->highLatsMethod;
    }

    /**
     * @param string $highLatsMethod
     * @return Configuration
     */
    public function setHighLatsMethod($highLatsMethod): Configuration
    {
        $this->highLatsMethod = $highLatsMethod;
        return $this;
    }

    public static function getHighLatsChoices()
    {
        return self::HIGH_LATS_CHOICES;
    }

    public static function getAsrMethodChoices()
    {
        return self::ASR_METHOD_CHOICES;
    }

    /**
     * @return bool
     */
    public function isIqamaFullScreenCountdown(): bool
    {
        return $this->iqamaFullScreenCountdown;
    }

    /**
     * @param bool $iqamaFullScreenCountdown
     * @return Configuration
     */
    public function setIqamaFullScreenCountdown(bool $iqamaFullScreenCountdown): Configuration
    {
        $this->iqamaFullScreenCountdown = $iqamaFullScreenCountdown;
        return $this;
    }

}
