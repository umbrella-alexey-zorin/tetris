<?php
    namespace AppBundle\Controller;
    
    use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
    use Symfony\Bundle\FrameworkBundle\Controller\Controller;
    use Symfony\Component\HttpFoundation\Request;
    use Symfony\Component\HttpFoundation\Response;
    use Symfony\Component\Security\Core\SecurityContext;
    use AppBundle\Entity\Users;
    
    class SecurityController extends Controller {
        /**
         * @Route("/login")
         */
        public function loginAction() {
            if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')) {
                return $this->redirect('/play', 301);
            }

            if ($this->get('request')->attributes->has(SecurityContext::AUTHENTICATION_ERROR)) {
                $error = $this->get('request')->attributes->get(SecurityContext::AUTHENTICATION_ERROR);
            } else {
                $error = $this->get('request')->getSession()->get(SecurityContext::AUTHENTICATION_ERROR);
            }
            
            return $this->render('default/login.html.twig', array(
                'error' => $error
            ));
        }

        /**
         * This is the route the login form submits to.
         *
         * But, this will never be executed. Symfony will intercept this first
         * and handle the login automatically. See form_login in app/config/security.yml
         *
         * @Route("/login_check", name="security_login_check")
         */
        public function loginCheckAction() {
            throw new \Exception('This should never be reached!');
        }
    }