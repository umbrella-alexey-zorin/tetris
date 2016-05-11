<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use AppBundle\Entity\Score;
use AppBundle\Entity\Users;

class DefaultController extends Controller {
    /**
     * @Route("/play", name="homepage")
     */
    public function indexAction() {
        return $this->render('default/index.html.twig', array());
    }

    /**
     * @Route("/play/getMyScore")
     */
    public function scoreAction() {
    	$request = Request::createFromGlobals();
    	$data = json_decode($request->getContent(), true);
    	if(!empty($data)) {
    		$score = new Score();
    		$score->setName($this->getUser()->getUsername());
    		$score->setScore($data['score']);
    		$score->setDatetime();
    		$em = $this->getDoctrine()->getManager();
            $em->persist($score);
            $em->flush();
            return new Response(json_encode($score));
    	} else {
    		$score = $this->getDoctrine()->getRepository('AppBundle:Score')->findByName($this->getUser()->getUsername());
			if(!empty($score)) {
				$arr = array();
				for($i = 0; $i < count($score); $i++) {
					$arr[] = array('name' => $score[$i]->getName(), 'score' => $score[$i]->getScore(), 'date' => $score[$i]->getDatetime()->format('d.m.Y H:i'));
				}
				return new Response(json_encode($arr));
			} else {
				return new Response('');
			}  		
    	}
   	
    }

    /**
     * @Route("/play/getTopScore")
	 */
	public function topscoreAction() {
	 	$em = $this->getDoctrine()->getManager();
	 	$query = $em->createQuery('SELECT p FROM AppBundle:Score p ORDER BY p.score DESC');
	 	$score = $query->setMaxResults(10)->getResult();
		if(!empty($score)) {
			$arr = array();
			for($i = 0; $i < count($score); $i++) {
				$arr[] = array('name' => $score[$i]->getName(), 'score' => $score[$i]->getScore(), 'date' => $score[$i]->getDatetime()->format('d.m.Y H:i'));
			}
			return new Response(json_encode($arr));
		} else {
			return new Response('');
		} 
	}

	 /**
	  * @Route("/play/saveGame")
	  */
	public function savegameAction() {
		$request = Request::createFromGlobals();
    	$data = json_decode($request->getContent(), true);
    	$em = $this->getDoctrine()->getManager();
    	$user = $em->getRepository('AppBundle:Users')->find($this->getUser()->getId());
    	if(!empty($data)) {
    		$user->setGameON($data['gameON']);
    		$user->setPause($data['pause']);
    		$user->setFigure(json_encode($data['figure']));
    		$user->setNextFigure(json_encode($data['nextFigure']));
    		$user->setPoints($data['points']);
    		$user->setLvl($data['lvl']);
    		$user->setCount($data['count']);
    		$user->setSpeed($data['speed']);
    		$user->setArr(json_encode($data['arr']));
    		$em->flush();
    		return new Response('');
    	} else {
    		if($user->getGameON()) {
    			$arr = array(
    					'gameON' => $user->getGameON(),
    					'pause' => $user->getPause(),
    					'figure' => $user->getFigure(),
    					'nextFigure' => $user->getNextFigure(),
    					'points' => $user->getPoints(),
    					'lvl' => $user->getLvl(),
    					'count' => $user->getCount(),
    					'speed' => $user->getSpeed(),
    					'arr' => $user->getArr()
    				);
    			return new Response(json_encode($arr));
    		}
    		return new Response('');
    	}
	}	

}
