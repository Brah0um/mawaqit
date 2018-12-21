<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Mosque;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class AndroidController extends Controller
{

    /**
     * @Route("/{mosque}/manifest.json", name="manifest")
     * @return JsonResponse
     */
    public function manifestAction(Mosque $mosque)
    {
        $manifest = [
            "short_name" => "Mawaqit",
            "name" => "Mawaqit",
            "icons" => [
                [
                    "src" => "/android-chrome-512x512.png",
                    "type" => "image/png",
                    "sizes" => "512x512"
                ], [
                    "src" => "/android-chrome-192x192.png",
                    "type" => "image/png",
                    "sizes" => "192x192"
                ]
            ],
            "lang" => "en",
            "start_url" => $this->generateUrl('mosque', ['slug' => $mosque->getSlug()]),
            "background_color" => "#000000",
            "theme_color" => "#000000",
            "display" => "standalone"
        ];

        return new JsonResponse($manifest);
    }
}
