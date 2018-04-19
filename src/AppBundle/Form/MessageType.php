<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use AppBundle\Entity\Message;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Translation\TranslatorInterface;



class MessageType extends AbstractType {

    /**
     * @var Translator
     */
    private $translator;

    public function __construct( TranslatorInterface $translator) {
        $this->translator = $translator;
    }


    public function buildForm(FormBuilderInterface $builder, array $options) {


        $builder
                ->add('title', null, [
                    'required' => false,
                    'attr' => [
                        'placeholder' => 'message.form.title.placeholder',
                        'maxlength' => "40",
                    ]
                ])
                ->add('content', TextareaType::class, [
                    'required' => false,
                    'attr' => [
                        'placeholder' => 'message.form.content.placeholder',
                        'maxlength' => "200",
                        'rows' => "6"
                    ],
                ])
                ->add('enabled', CheckboxType::class, [
                    'required' => false
                ])
                ->add('mobile', CheckboxType::class, [
                    'required' => false,
                    'attr' => [
                        'help' => $this->translator->trans('message.form.mobile.title'),
                    ]
                ])
                ->add('file', ImageType::class, [
                    'attr' => [
                        'class' => 'form-control',
                        'help' => $this->translator->trans('message.form.image.title'),
                    ]
                ])
                ->add('save', SubmitType::class, [
                    'label' => 'save',
                    'attr' => [
                        'class' => 'btn btn-lg btn-primary',
                    ]
                ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver) {
        $resolver->setDefaults(array(
            'label_format' => 'message.form.%name%.label',
            'data_class' => Message::class
        ));
    }

}
