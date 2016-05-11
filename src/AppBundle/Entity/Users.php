<?php
    namespace AppBundle\Entity;
    use Doctrine\ORM\Mapping as ORM;
    use Symfony\Component\Security\Core\User\UserInterface;

    /**
     * @ORM\Entity
     */
    class Users implements UserInterface{
        /**
         * @ORM\Column(type="integer")
         * @ORM\Id
         * @ORM\GeneratedValue(strategy="AUTO")
         */
        private $id;

        /**
         * @ORM\Column(type="string", length=100)
         */
        private $username;

        /**
         * @ORM\Column(type="string", length=100)
         */
        private $password;

        /**
         * @ORM\Column(type="string", length=100)
         */
        private $email;
    
        /**
        * Get id
        *
        * @return integer
        */
        public function getId() {
            return $this->id;
        }

        /**
        * Set username
        *
        * @param string $username
        * @return Users
        */
        public function setUsername($username) {
            $this->username = $username;
            return $this;
        }

        /**
        * Get username
        *
        * @return string
        */
        public function getUsername() {
            return $this->username;
        }

        /**
        * Set password
        *
        * @param string $password
        * @return Users
        */
        public function setPassword($password) {
            $this->password = $password;
            return $this;
        }

        /**
        * Get password
        *
        * @return string
        */
        public function getPassword() {
            return $this->password;
        }

        /**
        * Set email
        *
        * @param string $email
        * @return Users
        */
        public function setEmail($email) {
            $this->email = $email;
            return $this;
        }

        /**
        * Get email
        *
        * @return string
        */
        public function getEmail() {
            return $this->email;
        }

        public function getRoles() {
            $roles[] = 'ROLE_USER';
            return array_unique($roles);
        }

        public function getSalt() {
            return;
        }

        public function eraseCredentials() {
        
        }
}
