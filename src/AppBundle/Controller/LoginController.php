<?php

    namespace AppBundle\Controller;

    use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
    use Symfony\Bundle\FrameworkBundle\Controller\Controller;
    use Symfony\Component\HttpFoundation\Request;
    use Symfony\Component\HttpFoundation\Response;
    use Symfony\Component\HttpFoundation\Session\Session;
    use AppBundle\Entity\Users;

    class LoginController extends Controller {
        
        /**
         * @Route("login/registration/")
         */
        public function registrationAction() {
            $request = Request::createFromGlobals();
            $username = $request->request->get('username');
            $password = $request->request->get('password');
            $confirm_password = $request->get('confirm');
            $email = $request->request->get('email');
            //проверка введенных данных на допустимые символы
            if($msg = $this->check_login($username)) {
                return new Response(json_encode(array($msg, "error")));
            }
            if($msg = $this->check_email($email)) {
                return new Response(json_encode(array($msg, "error")));
            }
            if($msg = $this->check_password($password)) {
                return new Response(json_encode(array($msg, "error")));
            }
            //сравнение паролей
            if($msg = $this->check_confirm_password($password, $confirm_password)) {
                return new Response(json_encode(array($msg, "error")));
            }
            //проверка на существования username и email
            $isUser = $this->getDoctrine()->getRepository('AppBundle:Users')->findOneByUsername($username);
            if($isUser) {
                return new Response(json_encode(array("Такое имя уже существует", "error")));
            }
            $isEmail = $this->getDoctrine()->getRepository('AppBundle:Users')->findOneByEmail($email);
            if($isEmail) {
                return new Response(json_encode(array("Такое Email уже существует", "error")));
            }
            //генерация кода для активации аккаунта
            $activateCode = md5(time() . $username . 'abc1347');
            //создание нового пользователя
            $user = new Users();
            $encoder = $this->container->get('security.password_encoder');
            $encoded = $encoder->encodePassword($user, $password);
            $user->setUsername($username);
            $user->setPassword($encoded);
            $user->setEmail($email);
            $user->setIsActive(0);
            $user->setActivateCode($activateCode);
            $em = $this->getDoctrine()->getManager();
            $em->persist($user);
            $em->flush();
            //отправка письма с кодом для активации
            $this->resendemailAction($email);

            return new Response(json_encode(array("Все ок", "access")));
        }

        /**
         * @Route("/login/resendEmail/")
         */
        public function resendemailAction($toEmail = null) {
            // если email не передан в параметрах, то получаем его из запроса пользователя.
            if(!$toEmail) {
                $request = Request::createFromGlobals();
                $toEmail = $request->request->get('email');
            }
            //получение пользователя из бд
            $user = $this->getDoctrine()->getRepository('AppBundle:Users')->findOneByEmail($toEmail);
            if(!empty($user)) {
                if($user->isEnabled()) {
                    return new Response(json_encode(array("Аккаунт уже активирован", "error")));
                } else {
                    // если такой email существует и еще не активирован, отправляем письмо
                    $message = \Swift_Message::newInstance()
                        ->setSubject('Hello Email')
                        ->setFrom('zorin.avt@yandex.ru')
                        ->setTo($toEmail)
                        ->setBody(
                            $this->renderView('emailsTemplate/registration.html.twig',
                                array('name' => $user->getUsername(), 'code' => $user->getActivateCode())),
                            'text/html'
                        );
            
                    $this->get('mailer')->send($message);
                    return new Response(json_encode(array("Письмо отправлено", "error")));
                }
                
            } else {
                return new Response(json_encode(array("Такой Email не зарегистрирован", "error")));
            }
            
        }

        /**
         * @Route("/login/activate/{user}/{code}", name="activate_account")
         */
        public function activateaccountAction($code, $user) {
            //получаем пользователя из бд
            $em = $this->getDoctrine()->getManager();
            $user = $em->getRepository('AppBundle:Users')->findOneByUsername($user);

            if(!empty($user)) {

                if($user->isEnabled()) {
                    $this->get('session')->set('msg_error', 'Аккаунт уже активирован');
                  } else {
                    // если пользователь найден и аккаунт еще не активирован, то активируем
                    if($user->getActivateCode() == $code) {
                        $user->setIsActive(1);
                        $em->persist($user);
                        $em->flush();
                        $this->get('session')->set('msg_success', 'Аккаунт активирован');
                    } else {
                        $this->get('session')->set('msg_error', 'Неверный код активации');
                    }

                }

            } else {
                $this->get('session')->set('msg_error', 'Пользователь не найден');
            }
            //делаем активирован на страницу авторизации с записанным в сессии сообщением. Оно будет удалено сразу после показа.
            return $this->redirectToRoute('login');
        }

        /**
         * Запуск процедуры восстановления пароля (создание секретного кода и отправка письма на почту)
         * 
         * @Route("/login/initRecoveryPassword")
         */
        public function initRecoveryPasswordAction() {
            // запускаем функцию обновления значений-триггеров в бд, отвечающие за блокировку некоторых возможностей, 
            // в данном случае блокировка возможности потворно запросить восстановление пароля, если не прошло определенное кол-во времени.
            $this->updateDbFromTime();
            // Получаем введденые email и пытаемся найти пользователя
            $request = Request::createFromGlobals();
            $email = $request->request->get('email');
            $em = $this->getDoctrine()->getManager();
            $user = $em->getRepository('AppBundle:Users')->findOneByEmail($email);
            // Если пользователь найден, проверяем, не запрашивал ли он восстановление пароля в ближайшее время
            if(!empty($user)) {

                if($user->getPassRecoveryState()) {
                    return new Response(json_encode(array("Следующий запрос на восстановление пароля будет доступен через 4 часа", "error")));
                } else {
                    // если не запрашивал в ближайшее время, записываем в бд статус запроса - 1 (true), дату запроса и секретный код.
                    $code = md5(time() . $user->getPassword() . 'abc1347');
                    $user->setPassRecoveryState(1);
                    $user->setPassRecoveryDate();
                    $user->setPassRecoveryCode($code);
                    $em->persist($user);
                    $em->flush();
                    // отправляем на почту ссылку на страницу смены пароля
                    $message = \Swift_Message::newInstance()
                        ->setSubject('Hello Email')
                        ->setFrom('zorin.avt@yandex.ru')
                        ->setTo($user->getEmail())
                        ->setBody(
                            $this->renderView('emailsTemplate/recoveryPassword.html.twig',
                                array('name' => $user->getUsername(), 'code' => $code)),
                            'text/html'
                        );
            
                    $this->get('mailer')->send($message);
                    return new Response(json_encode(array("Вам на почту было отправлено письмо с инструкцией для восстановления пароля", "error")));
                }

            } else {
                return new Response(json_encode(array("Такой Email не зарегистрирован", "error")));
            }
        }

        /**
         * Страница восстановления пароля
         *
         * @Route("/login/recoveryPassword/{user}/{code}", name="recovery_password")
         */
        public function recoveryPasswordAction($user, $code) {
            //запускаем функцию обновления триггеров в бд
            $this->updateDbFromTime();
            $request = Request::createFromGlobals();
            $newPassword = $request->request->get('password');
            $confirmPassword = $request->request->get('confirm');
            //получаем пользователя из бд
            $em = $this->getDoctrine()->getManager();
            $user = $em->getRepository('AppBundle:Users')->findOneByUsername($user);
            if(!empty($user)) {
                //если такой пользователь есть, посмотрим в бд статус запроса пароля.
                if($user->getPassRecoveryState()) {
                    //если true, проверяем code
                    if($user->getPassRecoveryCode() == $code) {
                        //если true и POST передан пароль запускаем проверку и запись пароля
                        if($newPassword) {
                            //валидация пароля
                            if($msg = $this->check_password($newPassword)) {
                                $this->get('session')->set('msg_error', $msg);
                                return $this->redirectToRoute('login');
                            }
                            //сравнение паролей
                            if($msg = $this->check_confirm_password($newPassword, $confirmPassword)) {
                                $this->get('session')->set('msg_error', $msg);
                                return $this->redirectToRoute('login');
                            }
                            //шифрование пароля
                            $encoder = $this->container->get('security.password_encoder');
                            $encodedPassword = $encoder->encodePassword($user, $newPassword);
                            //запись нового пароля в бд
                            $user->setPassword($encodedPassword);
                            $user->setPassRecoveryState(0);
                            $em->persist($user);
                            $em->flush();
                            //запись сообщения об успехе и редирект на страницу авторизации
                            $this->get('session')->set('msg_success', "Пароль успешно изменен");
                            return $this->redirectToRoute('login');
                        } else {
                            // если true и в POST нет пароля, рендерим страницу и позволяем ввести новый пароль
                            return $this->render('default/recoveryPassword.html.twig', array(
                                'name' => $user->getUsername(), 'code' => $code
                            ));
                        }
                    } else {
                        $this->get('session')->set('msg_error', 'Ошибка в запросе, проверьте правильность введенных данных');
                    }
                } else {
                    $this->get('session')->set('msg_error', 'Запрос устарел');
                }
            } else {
                $this->get('session')->set('msg_error', 'Пользователь не найден');
            }
            //в ином случае записываем текст ошибки в сессию и перенаправляем пользователя на страницу авторизации
            return $this->redirectToRoute('login');
        }

    
        // валидация логина
        private function check_login($username) {
            if(strlen($username) < 3 || strlen($username) > 15) {
                return "Логин должен соджержать более 2х символов, но не больше 15";
            }
            if(!preg_match( '/^[a-zA-Z][a-zA-Z0-9-_\.]+$/', $username)) {
                return "Неверный формат!!!";
            }
            return false;
        }
        // валидация пароля
        private function check_password($password) {
            if(strlen($password) < 4 || strlen($password) > 15) {
                return "Пароль должен содержать более 3 символов, но не больше 15";
            }
            if(!preg_match( '/^[a-zA-Z0-9]+$/', $password)) {
                return "Пароль можеь содержать только символы латинского алфавита и цифры";
            }
            return false;
        }

        // сравнение на индентичность паролей
        private function check_confirm_password($password, $confirm_password) {
            if($password != $confirm_password) {
                return "Пароли должны совпадать";
            }
            return false;
        }
        // валидация email
        private function check_email($email) {
            if(!preg_match( '/^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/', $email)) {
                return "Неверный формат E-mail";
            }
            return false;
        }

        //Функция отвечающая за обновление значений-триггеров в бд, блокирующие некоторые возможности пользователя 
        private function updateDbFromTime() {
            $nowDate = new \DateTime("now");
            $nowDate = $nowDate->format('Y-m-d H:i:s');
            $this->getDoctrine()->getManager()->createQuery("UPDATE AppBundle:Users p SET p.passRecoveryState=0 WHERE UNIX_TIMESTAMP('$nowDate') - UNIX_TIMESTAMP(p.passRecoveryDate) > 120" )->execute();
        }

    }