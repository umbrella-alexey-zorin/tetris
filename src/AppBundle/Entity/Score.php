<?php
    namespace AppBundle\Entity;
    use Doctrine\ORM\Mapping as ORM;

    /**
     * @ORM\Entity
     */
    class Score {
    	/**
         * @ORM\Column(type="integer")
         * @ORM\Id
         * @ORM\GeneratedValue(strategy="AUTO")
         */
        private $id;

        /**
         * @ORM\Column(type="string", length=100)
         */
        private $name;

        /**
         * @ORM\Column(type="integer")
         */
        private $score;

        /**
         * @ORM\Column(type="datetime")
         */
        private $date;
    
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
     * @return Score
     */
    public function setName($name) {
        $this->name = $name;
        return $this;
    }

    /**
     * Get username
     *
     * @return string 
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Get date and time
     *
     * @return date
     */
    public function getDatetime() {
        return $this->date;
    }

    /**
     * Set date and time
     *
     * @return Score
     */
    public function setDatetime() {
        $this->date = new \DateTime("now");
        return $this;
    }

    /**
     * Get score(points)
     *
     * @return integer
     */
    public function getScore() {
        return $this->score;
    }

    /**
     * Set score (points)
     *
     * @return Score
     */
    public function setScore($score) {
        $this->score = $score;
        return $this;
    }
}
