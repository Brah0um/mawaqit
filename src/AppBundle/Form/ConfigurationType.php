<?php

namespace AppBundle\Form;

use AppBundle\Entity\Configuration;
use AppBundle\Form\DataTransformer\PrayerTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Validator\Constraints\Choice;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Range;
use Symfony\Component\Validator\Constraints\Regex;

class ConfigurationType extends AbstractType
{

    /**
     * @var Translator
     */
    private $translator;

    /**
     * @var Array
     */
    private static $timezones = [
        "-12.00" => "(GMT-12:00) International Date Line West",
        "-11.00" => "(GMT-11:00) Midway Island, Samoa",
        "-10.00" => "(GMT-10:00) Hawaii",
        "-9.00" => "(GMT-09:00) Alaska",
        "-8.00" => "(GMT-08:00) Pacific Time (US & Canada), Tijuana, Baja California",
        "-7.00" => "(GMT-07:00) Arizona, Chihuahua, La Paz, Mazatlan, Mountain Time (US & Canada)",
        "-6.00" => "(GMT-06:00) Central Time (US & Canada), Guadalajara, Mexico City, Monterrey, Saskatchewan, ",
        "-5.00" => "(GMT-05:00) Bogota, Lima, Quito, Rio Branco, Eastern Time (US & Canada), Indiana (East)",
        "-4.00" => "(GMT-04:00) Atlantic Time (Canada), Caracas, La Paz, Manaus, Santiago",
        "-3.50" => "(GMT-03:30) Newfoundland",
        "-3.00" => "(GMT-03:00) Brasilia, Buenos Aires, Georgetown, Greenland, Montevideo",
        "-2.00" => "(GMT-02:00) Mid-Atlantic",
        "-1.00" => "(GMT-01:00) Cape Verde Is, Azores",
        "0.00" => "(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London, Casablanca, Monrovia, Reykjavik",
        "1.00" => "(GMT+01:00) Paris, Brussels, Copenhagen, Madrid, Amsterdam, Berlin, Bern, Rome, West Central Africa",
        "2.00" => "(GMT+02:00) Amman, Athens, Bucharest, Istanbul, Beirut, Cairo",
        "3.00" => "(GMT+03:00) Kuwait, Riyadh, Baghdad, Moscow, Nairobi",
        "3.50" => "(GMT+03:30) Tehran",
        "4.00" => "(GMT+04:00) Abu Dhabi, Muscat",
        "4.50" => "(GMT+04:30) Kabul",
        "5.00" => "(GMT+05:00) Islamabad, Karachi, Tashkent",
        "5.50" => "(GMT+05:30) Sri Jayawardenapura, Chennai, Kolkata, Mumbai, New Delh",
        "5.75" => "(GMT+05:45) Kathmandu",
        "6.00" => "(GMT+06:00) Almaty, Novosibirsk",
        "6.50" => "(GMT+06:30) Yangon (Rangoon)",
        "7.00" => "(GMT+07:00) Bangkok, Hanoi, Jakarta",
        "8.00" => "(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi, Kuala Lumpur, Singapore",
        "9.00" => "(GMT+09:00) Osaka, Sapporo, Tokyo, Seoul",
        "9.50" => "(GMT+09:30) Adelaide, Darwin",
        "10.00" => "(GMT+10:00) Canberra, Melbourne, Sydney",
        "11.00" => "(GMT+11:00) Magadan, Solomon Is., New Caledonia",
        "12.00" => "(GMT+12:00) Fiji, Kamchatka, Marshall Is.",
        "13.00" => "(GMT+13:00) Nuku'alofa"
    ];

    /**
     * @var Array
     */
    private static $dstChoices = [
        "dst-auto" => 2,
        "dst-disabled" => 0,
        "dst-enabled" => 1
    ];

    /**
     * @var Array
     */
    private static $randomHadithIntervalDisabling = [
        "" => "",
        "fajr-zuhr" => "0-1",
        "zuhr-asr" => "1-2",
        "asr-maghrib" => "2-3",
        "maghrib-isha" => "3-4"
    ];

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {

        $adjustedTimesValues = range(-30, 30);
        $timePattern = '/^\d{2}:\d{2}$/';

        $builder
            ->add('jumuaTime', null, [
                'constraints' => new Regex(['pattern' => $timePattern]),
                'attr' => [
                    'help' => $this->translator->trans('configuration.form.jumuaTime.title'),
                    'placeholder' => 'hh:mm'
                ]
            ])
            ->add('jumuaTime2', null, [
                'constraints' => new Regex(['pattern' => $timePattern]),
                'attr' => [
                    'help' => $this->translator->trans('configuration.form.jumuaTime2.title'),
                    'placeholder' => 'hh:mm'
                ]
            ])
            ->add('jumuaAsDuhr', CheckboxType::class, [
                'required' => false,
            ])
            ->add('noJumua', CheckboxType::class, [
                'required' => false,
            ])
            ->add('jumuaDhikrReminderEnabled', CheckboxType::class, [
                'required' => false,
                'attr' => [
                    'help' => 'configuration.form.jumuaDhikrReminderEnabled.title',
                ]
            ])
            ->add('jumuaBlackScreenEnabled', CheckboxType::class, [
                'required' => false,
            ])
            ->add('jumuaTimeout', IntegerType::class, [
                'constraints' => new Range(['min' => 20]),
                'attr' => [
                    'min' => 20
                ]
            ])
            ->add('aidTime', null, [
                'constraints' => new Regex(['pattern' => $timePattern]),
                'attr' => [
                    'help' => $this->translator->trans('configuration.form.aidTime.title'),
                    'placeholder' => 'hh:mm'
                ]
            ])
            ->add('imsakNbMinBeforeFajr', IntegerType::class, [
                'attr' => [
                    'help' => $this->translator->trans('configuration.form.imsakNbMinBeforeFajr.title'),
                    'min' => 0
                ]
            ])
            ->add('maximumIshaTimeForNoWaiting', null, [
                'constraints' => new Regex(['pattern' => $timePattern]),
                'attr' => [
                    'help' => $this->translator->trans('configuration.form.maximumIshaTimeForNoWaiting.title'),
                    'placeholder' => 'hh:mm',
                ]
            ])
            ->add('waitingTimes', PrayerType::class, [
                'sub_options' => [
                    'type' => IntegerType::class,
                    'constraints' => new NotBlank(['message' => "form.configuration.mandatory"]),
                    'attr' => [
                        'min' => 0
                    ]
                ]
            ])
            ->add('adjustedTimes', PrayerType::class, [
                'constraints' => new NotBlank(['message' => "form.configuration.mandatory"]),
                'sub_options' => [
                    'type' => ChoiceType::class,
                    'choices' => array_combine($adjustedTimesValues, $adjustedTimesValues)

                ]
            ])
            ->add('fixedTimes', PrayerType::class, [
                'required' => false,
                'attr' => [
                    'help' => $this->translator->trans('configuration.form.fixedTimes.title')
                ],
                'sub_options' => [
                    'type' => TextType::class,
                    'constraints' => new Regex(['pattern' => $timePattern]),
                    'attr' => [
                        'placeholder' => "hh:mm"
                    ]
                ]
            ])
            ->add('duaAfterPrayerShowTimes', PrayerType::class, [
                'sub_options' => [
                    'type' => IntegerType::class,
                    'constraints' => new NotBlank(['message' => "form.configuration.mandatory"]),
                    'attr' => [
                        'min' => 5
                    ]
                ],
                'attr' => [
                    'help' => $this->translator->trans('configuration.form.duaAfterPrayerShowTimes.title'),
                ],
            ])
            ->add('hijriAdjustment', ChoiceType::class, [
                'choices' => [-2 => -2, -1 => -1, 0 => 0, 1 => 1, 2 => 2],
            ])
            ->add('timezone', ChoiceType::class, [
                'choices' => array_flip(self::$timezones),
                'attr' => [
                    'help' => 'configuration.form.timezone.title',
                ],
            ])
            ->add('dst', ChoiceType::class, [
                'choices' => self::$dstChoices,
                'attr' => [
                    'help' => 'configuration.form.dst.title',
                ],
            ])
            ->add('dstSummerDate', DateType::class, [
                'required' => false,
                'widget' => 'single_text',
                'placeholder' => 'jj/mm/aaaa',
                'attr' => [
                    'help' => 'configuration.form.dstSummerDate.title',
                ],
            ])
            ->add('dstWinterDate', DateType::class, [
                'required' => false,
                'placeholder' => 'jj/mm/aaaa',
                'widget' => 'single_text',
                'attr' => [
                    'help' => 'configuration.form.dstWinterDate.title',
                ],
            ])
            ->add('hadithLang', ChoiceType::class, [
                'choices' => array_combine(Configuration::HADITH_LANG, Configuration::HADITH_LANG),
            ])
            ->add('asrMethod', ChoiceType::class, [
                'choices' => [
                    "configuration.form.asrMethod.Standard" => "Standard",
                    "configuration.form.asrMethod.Hanafi" => "Hanafi",
                ]
            ])
            ->add('highLatsMethod', ChoiceType::class, [
                'required' => false,
                'choices' => [
                    "configuration.form.highLatsMethod.AngleBased" => "AngleBased",
                    "configuration.form.highLatsMethod.NightMiddle" => "NightMiddle",
                    "configuration.form.highLatsMethod.OneSeventh" => "OneSeventh"
                ]
            ])
            ->add('hijriDateEnabled', CheckboxType::class, [
                'required' => false,
            ])
            ->add('duaAfterAzanEnabled', CheckboxType::class, [
                'required' => false,
            ])
            ->add('duaAfterPrayerEnabled', CheckboxType::class, [
                'required' => false,
            ])
            ->add('azanVoiceEnabled', CheckboxType::class, [
                'required' => false,
                'attr' => [
                    'help' => 'configuration.form.azanVoiceEnabled.title',
                ],
            ])
            ->add('wakeAzanVoice', ChoiceType::class, [
                'choices' => [
                    "configuration.form.wakeAzanVoice.haram" => "adhan-maquah",
                    "configuration.form.wakeAzanVoice.algeria" => "adhan-algeria",
                    "configuration.form.wakeAzanVoice.quds" => "adhan-quds",
                    "configuration.form.wakeAzanVoice.egypt" => "adhan-egypt",
                ]
            ])
            ->add('iqamaFullScreenCountdown', CheckboxType::class, [
                'required' => false,
            ])
            ->add('blackScreenWhenPraying', CheckboxType::class, [
                'required' => false,
                'attr' => [
                    'help' => 'configuration.form.blackScreenWhenPraying.title',
                ],
            ])
            ->add('sourceCalcul', ChoiceType::class, [
                'choices' => array_combine(Configuration::SOURCE_CHOICES, Configuration::SOURCE_CHOICES)
            ])
            ->add('prayerMethod', ChoiceType::class, [
                'choices' => array_combine(Configuration::METHOD_CHOICES, Configuration::METHOD_CHOICES)
            ])
            ->add('fajrDegree', IntegerType::class, [
                'required' => false,
                'attr' => [
                    'placeholder' => 'configuration.form.fajrDegree.placeholder'
                ]
            ])
            ->add('ishaDegree', IntegerType::class, [
                'required' => false,
                'attr' => [
                    'placeholder' => 'configuration.form.ishaDegree.placeholder'
                ]
            ])
            ->add('iqamaDisplayTime', IntegerType::class, [
                'constraints' => new Range(['min' => 5]),
                'label' => 'configuration.form.iqamaDisplayTime.label',
                'attr' => [
                    'min' => 5
                ]
            ])
            ->add('wakeForFajrTime', IntegerType::class, [
                'required' => false,
                'attr' => [
                    'min' => 0,
                    'help' => 'configuration.form.wakeForFajrTime.title',
                ]
            ])
            ->add('urlQrCodeEnabled', CheckboxType::class, [
                'required' => false,
                'attr' => [
                    'help' => 'configuration.form.urlQrCodeEnabled.title',
                ]
            ])
            ->add('smallScreen', CheckboxType::class, [
                'required' => false,
                'label' => 'configuration.form.smallScreen.label',
                'attr' => [
                    'help' => 'configuration.form.smallScreen.title',
                ]
            ])
            ->add('ishaFixation', ChoiceType::class, [
                'required' => false,
                'placeholder' => 'select_a_value',
                'choices' => [
                    '1h05' => 65,
                    '1h10' => 70,
                    '1h15' => 75,
                    '1h30' => 90,
                    '1h45' => 105,
                    '2h00' => 120,
                ],
                'attr' => [
                    'help' => 'configuration.form.ishaFixation.title',
                ]
            ])
            ->add('randomHadithEnabled', CheckboxType::class, [
                'required' => false,
                'label' => 'configuration.form.randomHadithEnabled.label',
                'attr' => [
                    'help' => 'configuration.form.randomHadithEnabled.title',
                ]
            ])
            ->add('randomHadithIntervalDisabling', ChoiceType::class, [
                'required' => false,
                'choices' => self::$randomHadithIntervalDisabling,
                'attr' => [
                    'help' => 'configuration.form.randomHadithIntervalDisabling.title',
                ]
            ])
            ->add('iqamaEnabled', CheckboxType::class, [
                'required' => false,
                'label' => 'configuration.form.iqamaEnabled.label',
                'attr' => [
                    'help' => 'configuration.form.iqamaEnabled.title',
                ]
            ])
            ->add('temperatureEnabled', CheckboxType::class, [
                'required' => false,
                'attr' => [
                    'help' => 'configuration.form.temperatureEnabled.title',
                ]
            ])
            ->add('footer', CheckboxType::class, [
                'required' => false,
                'label' => 'configuration.form.footer.label'
            ])
            ->add('timeDisplayFormat', ChoiceType::class, [
                'choices' => ["24h" => "24", "12h" => "12"],
                'constraints' => [
                    new Choice(['choices' => ["24", "12"]]),
                    new NotBlank(),
                ],
                'expanded' => true,
                'label_attr' => array(
                    'class' => 'radio-inline'
                )
            ])
            ->add('backgroundType', ChoiceType::class, [
                'choices' => ["color" => "color", "motif" => "motif"],
                'constraints' => [
                    new Choice(['choices' => ["color", "motif"]]),
                    new NotBlank(),
                ]
            ])
            ->add('backgroundMotif', ChoiceType::class, [
                'choices' => range(1, 20),
                'constraints' => [
                    new NotBlank(),
                ]
            ])
            ->add('backgroundColor', null)
            ->add('calendar')
            ->add('timeToDisplayMessage', IntegerType::class, [
                'required' => false,
                'attr' => [
                    'min' => 5,
                    'max' => 60
                ]
            ])
            ->add('showNextAdhanCountdown', CheckboxType::class, [
                'required' => false,
            ])
            ->add('save', SubmitType::class, [
                'label' => 'save',
                'attr' => [
                    'class' => 'btn btn-primary',
                ]
            ]);

        $builder->get('waitingTimes')
            ->addModelTransformer(new PrayerTransformer(IntegerType::class));
        $builder->get('adjustedTimes')
            ->addModelTransformer(new PrayerTransformer(IntegerType::class));
        $builder->get('fixedTimes')
            ->addModelTransformer(new PrayerTransformer(TimeType::class));
        $builder->get('duaAfterPrayerShowTimes')
            ->addModelTransformer(new PrayerTransformer(IntegerType::class));
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => Configuration::class,
            'allow_extra_fields' => true,
            'choice_translation_domain' => true,
            'label_format' => 'configuration.form.%name%.label'
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'configuration';
    }

}
