<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Mosque;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class MosqueController extends Controller
{

    /**
     * @deprecated
     * @Route("/mosque/{slug}/{_locale}", options={"i18n"="false"}, requirements={"_locale"= "en|fr|ar|tr"})
     * @ParamConverter("mosque", options={"mapping": {"slug": "slug"}})
     * @param Mosque $mosque
     * @return Response
     */
    public function mosqueDeprected1Action(Mosque $mosque)
    {
        return $this->forward("AppBundle:Mosque:mosque", ["slug" => $mosque->getSlug()]);
    }

    /**
     * @deprecated
     * @Route("/{slug}/{_locale}", options={"i18n"="false"}, requirements={"_locale"= "en|fr|ar|tr"})
     * @param Mosque $mosque
     * @ParamConverter("mosque", options={"mapping": {"slug": "slug"}})
     * @return Response
     */
    public function mosqueDeprected2Action(Mosque $mosque)
    {
        return $this->forward("AppBundle:Mosque:mosque", ["slug" => $mosque->getSlug()]);
    }

    /**
     * @Route("/{slug}", options={"i18n"="false"})
     * @ParamConverter("mosque", options={"mapping": {"slug": "slug"}})
     * @param Mosque $mosque
     * @return Response
     */
    public function mosqueWithoutLocalAction(Mosque $mosque)
    {
        $locale = 'fr';
        $savedLocale = $mosque->getLocale();
        if ($savedLocale) {
            $locale = $savedLocale;
        }

        return $this->forward("AppBundle:Mosque:mosque", [
            "slug" => $mosque->getSlug(),
            "_locale" => $locale
        ]);
    }

    /**
     * @Route("/{slug}", name="mosque")
     * @ParamConverter("mosque", options={"mapping": {"slug": "slug"}})
     * @param Request $request
     * @param Mosque $mosque
     * @return Response
     */
    public function mosqueAction(Request $request, Mosque $mosque)
    {

        if (!$mosque->isValidated()) {
            throw new NotFoundHttpException();
        }

        // saving locale
        $em = $this->getDoctrine()->getManager();
        $savedLocale = $mosque->getLocale();
        if ($this->get('app.request_service')->isLocal() && $savedLocale !== $request->getLocale()) {
            $mosque->setLocale($request->getLocale());
            $em->persist($mosque);
            $em->flush();
        }

        $mobileDetect = $this->get('mobile_detect.mobile_detector');
        $view = $request->query->get("view");
        $template = 'mosque';
        $messages = [];

        // if mobile device request
        if (($view !== "desktop" && $mobileDetect->isMobile() && !$mobileDetect->isTablet()) || $view === "mobile") {
            $template .= '_mobile';
            $em = $this->getDoctrine()->getManager();
            $messages = $em->getRepository("AppBundle:Message")->getMessagesByMosque($mosque, null, true);
        }

        return $this->render("mosque/$template.html.twig", [
            'mosque' => $mosque,
            'confData' => $this->get('serializer')->serialize($mosque->getConfiguration(), 'json'),
            'languages' => $this->getParameter('languages'),
            'version' => $this->getParameter('version'),
            "supportEmail" => $this->getParameter("supportEmail"),
            "postmasterAddress" => $this->getParameter("postmaster_address"),
            "mawaqitApiAccessToken" => $this->getParameter("mawaqit_api_access_token"),
            'messages' => $messages
        ]);
    }

    /**
     * @Route("/{slug}/has-been-updated/{lastUpdatedDate}", name="mosque_has_been_updated_deprecated", options={"i18n"="false"})
     * @ParamConverter("mosque", options={"mapping": {"slug": "slug"}})
     */
    public function hasUpdatedAjaxDeprecatedAction(Request $request, Mosque $mosque, $lastUpdatedDate)
    {
        return $this->forward("AppBundle:Mosque:hasUpdatedAjax", [
            "slug" => $mosque->getSlug(),
            "request" => $request
        ]);
    }

    /**
     * @Route("/{slug}/has-been-updated", name="mosque_has_been_updated", options={"i18n"="false"})
     * @ParamConverter("mosque", options={"mapping": {"slug": "slug"}})
     */
    public function hasBeenUpdatedAjaxAction(Request $request, Mosque $mosque)
    {
        $lastUpdatedDate = $request->query->get("lastUpdatedDate");
        if (empty($lastUpdatedDate)) {
            return new JsonResponse(["hasBeenUpdated" => false]);
        }

        $hasBeenUpdated = $this->get("app.prayer_times")->mosqueHasBeenUpdated($mosque, $lastUpdatedDate);
        return new JsonResponse(["hasBeenUpdated" => $hasBeenUpdated]);
    }

    /**
     * get weather of the mosque city
     * @Route("/{slug}/weather", name="weather")
     * @ParamConverter("mosque", options={"mapping": {"slug": "slug"}})
     */
    public function getTemperatureAjaxAction(Mosque $mosque)
    {
        return new JsonResponse($this->get("app.weather_service")->getWeather($mosque));
    }

}
