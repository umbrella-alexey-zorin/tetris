<?php

    namespace AppBundle\Controller;

    use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
    use Symfony\Bundle\FrameworkBundle\Controller\Controller;
    use Symfony\Component\HttpFoundation\Request;
    use Symfony\Component\HttpFoundation\Response;
    use AppBundle\Entity\Users;

    class LoginController extends Controller {
        /**
        * @Route("/login")
        */
        public function indexAction() {
            return $this->render('default/login.html.twig', array(
                'username' => 'admin'
            ));
        }

        /**
         * @Route("login/registration/")
         */
        public function registrationAction() {
            $request = Request::createFromGlobals();
            $username = $request->request->get('username');
            $password = $request->request->get('password');
            $confirm_password = $request->get('confirm');
            $email = $request->request->get('email');

            if($msg = $this->check_login($username)) {
                return new Response($msg);
            }
            if($msg = $this->check_email($email)) {
                return new Response($msg);
            }
            if($msg = $this->check_password($password)) {
                return new Response($msg);
            }
            if($msg = $this->check_confirm_password($password, $confirm_password)) {
                return new Response($msg);
            }

            $isUser = $this->getDoctrine()->getRepository('AppBundle:Users')->findOneByUsername($username);
            if($isUser) {
                return new Response(json_encode(array("Такое имя уже существует", "error")));
            }
            $isEmail = $this->getDoctrine()->getRepository('AppBundle:Users')->findOneByEmail($email);
            if($isEmail) {
                return new Response(json_encode(array("Такое Email уже существует", "error")));
            }

            $user = new Users();
            $user->setUsername($username);
            $user->setPassword($password);
            $user->setEmail($email);
            $em = $this->getDoctrine()->getManager();
            $em->persist($user);
            $em->flush();

            return new Response(json_encode(array("Все ок", "error")));
        }

        private function check_login($username) {
            if(strlen($username) < 3 || strlen($username) > 15) {
                return json_encode(array("Логин должен соджержать более 2х символов, но не больше 15", "error"));
            }
            if(!preg_match( '/^[a-zA-Z][a-zA-Z0-9-_\.]+$/', $username)) {
                return json_encode(array("Неверный формат!!!", "error"));
            }
            return false;
        }
        //Проверка пароля.
        private function check_password($password) {
            if(strlen($password) < 4 || strlen($password) > 15) {
                return json_encode(array("Пароль должен содержать более 3 символов, но не больше 15", "error"));
            }
            if(!preg_match( '/^[a-zA-Z0-9]+$/', $password)) {
                return json_encode(array("Пароль можеь содержать только символы латинского алфавита и цифры", "error"));
            }
            return false;
        }

        private function check_confirm_password($password, $confirm_password) {
            if($password != $confirm_password) {
                return json_encode(array("Пароли должны совпадать", "error"));
            }
            return false;
        }

        private function check_email($email) {
            if(!preg_match( '/^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/', $email)) {
                return json_encode(array("Неверный формат E-mail", "error"));
            }
            return false;
        }

    }