<?php

	$year = date('Y');
	$month = date('m');

	echo json_encode(array(
	
		array(
			'id' => 1,
			'title' => "Event 1",
			'start' => "$year-$month-10",
			'url' => "http://themeforest.com/"
		),
		
		array(
			'id' => 2,
			'title' => "Event 2",
			'start' => "$year-$month-15",
			'end' => "$year-$month-15",
			'url' => "http://themeforest.com/"
		),
		
		array(
			'id' => 3,
			'title' => "Event 3",
			'start' => "$year-$month-22",
			'end' => "$year-$month-23",
			'url' => "http://themeforest.com/"
		),
		
		array(
			'id' => 4,
			'title' => "Event 4",
			'start' => "$year-$month-26",
			'url' => "http://themeforest.com/"
		)
	
	));

?>
