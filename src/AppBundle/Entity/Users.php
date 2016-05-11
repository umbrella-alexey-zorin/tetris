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
         * @ORM\Column(type="boolean")
         */
        private $gameON;

        /**
         * @ORM\Column(type="boolean")
         */
        private $pause;

        /**
         * @ORM\Column(type="string", length=1000)
         */
        private $figure;

        /**
         * @ORM\Column(type="string", length=1000)
         */
        private $nextFigure;

        /**
         * @ORM\Column(type="integer")
         */

        private $points;

        /**
         * @ORM\Column(type="integer")
         */
        private $lvl;

        /**
         * @ORM\Column(type="integer")
         */
        private $count;

        /**
         * @ORM\Column(type="integer")
         */
        private $speed;

        /**
         * @ORM\Column(type="string", length=5000)
         */
        private $arr;
    
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

    /**
     * Set gameON
     *
     * @param boolean $gameON
     * @return Users
     */
    public function setGameON($gameON) {
        $this->gameON = $gameON;
        return $this;
    }

    /**
     * Get gameON
     *
     * @return boolean 
     */
    public function getGameON() {
        return $this->gameON;
    }

    /**
     * Set pause
     *
     * @param boolean $pause
     * @return Users
     */
    public function setPause($pause) {
        $this->pause = $pause;
        return $this;
    }

    /**
     * Get pause
     *
     * @return boolean 
     */
    public function getPause() {
        return $this->pause;
    }

    /**
     * Set figure
     *
     * @param string $figure
     * @return Users
     */
    public function setFigure($figure) {
        $this->figure = $figure;
        return $this;
    }

    /**
     * Get figure
     *
     * @return string 
     */
    public function getFigure() {
        return $this->figure;
    }

    /**
     * Set nextFigure
     *
     * @param string $nextFigure
     * @return Users
     */
    public function setNextFigure($nextFigure) {
        $this->nextFigure = $nextFigure;
        return $this;
    }

    /**
     * Get nextFigure
     *
     * @return string 
     */
    public function getNextFigure() {
        return $this->nextFigure;
    }

    /**
     * Set points
     *
     * @param integer $points
     * @return Users
     */
    public function setPoints($points) {
        $this->points = $points;
        return $this;
    }

    /**
     * Get points
     *
     * @return integer 
     */
    public function getPoints() {
        return $this->points;
    }

    /**
     * Set lvl
     *
     * @param integer $lvl
     * @return Users
     */
    public function setLvl($lvl) {
        $this->lvl = $lvl;
        return $this;
    }

    /**
     * Get lvl
     *
     * @return integer 
     */
    public function getLvl() {
        return $this->lvl;
    }

    /**
     * Set count
     *
     * @param integer $count
     * @return Users
     */
    public function setCount($count) {
        $this->count = $count;
        return $this;
    }

    /**
     * Get count
     *
     * @return integer 
     */
    public function getCount() {
        return $this->count;
    }

    /**
     * Set speed
     *
     * @param integer $speed
     * @return Users
     */
    public function setSpeed($speed) {
        $this->speed = $speed;
        return $this;
    }

    /**
     * Get speed
     *
     * @return integer 
     */
    public function getSpeed() {
        return $this->speed;
    }

    /**
     * Set arr
     *
     * @param string $arr
     * @return Users
     */
    public function setArr($arr) {
        $this->arr = $arr;
        return $this;
    }

    /**
     * Get arr
     *
     * @return string 
     */
    public function getArr() {
        return $this->arr;
    }
}
