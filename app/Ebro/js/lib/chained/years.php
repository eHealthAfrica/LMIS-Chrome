<?php

/* Ebro Admin JSON */

if (!isset($_GET["chn_year"])) {
    $response[""] = "- Day -";
}

if (!isset($_GET["chn_month"])) {
    $response[""] = "- Month -";
}

if ($_GET["chn_year"]) {
    $response[""] = "--";
    if (in_array($_GET["chn_year"], array("2006", "2007", "2009", "2010", "2011", "2013"))) {
        $response[""] = "- Month -";
        $response["January"] = "January";
        $response["February"] = "February";
        $response["March"] = "March";
        $response["April"] = "April";
        $response["May"] = "May";
        $response["June"] = "June";
        $response["July"] = "July";
        $response["August"] = "August";
        $response["September"] = "September";
        $response["October"] = "October";
        $response["November"] = "November";
        $response["December"] = "December";
    };
    if (in_array($_GET["chn_year"], array("2008", "2012"))) {
        $response[""] = "- Month -";
        $response["January"] = "January";
        $response["February_leap"] = "February";
        $response["March"] = "March";
        $response["April"] = "April";
        $response["May"] = "May";
        $response["June"] = "June";
        $response["July"] = "July";
        $response["August"] = "August";
        $response["September"] = "September";
        $response["October"] = "October";
        $response["November"] = "November";
        $response["December"] = "December";
    };
}
if ($_GET["chn_month"]) {
    if ($_GET["chn_month"] == "February") {
        $response[""] = "- Day -";
        $response["day1"] = "01";
        $response["day2"] = "02";
        $response["day3"] = "03";
        $response["day4"] = "04";
        $response["day5"] = "05";
        $response["day6"] = "06";
        $response["day7"] = "07";
        $response["day8"] = "08";
        $response["day9"] = "09";
        $response["day10"] = "10";
        $response["day11"] = "11";
        $response["day12"] = "12";
        $response["day13"] = "13";
        $response["day14"] = "14";
        $response["day15"] = "15";
        $response["day16"] = "16";
        $response["day17"] = "17";
        $response["day18"] = "18";
        $response["day19"] = "19";
        $response["day20"] = "20";
        $response["day21"] = "21";
        $response["day22"] = "22";
        $response["day23"] = "23";
        $response["day24"] = "24";
        $response["day25"] = "25";
        $response["day26"] = "26";
        $response["day27"] = "27";
        $response["day28"] = "28";
    } else if ($_GET["chn_month"] == "February_leap") {
        $response[""] = "- Day -";
        $response["day1"] = "01";
        $response["day2"] = "02";
        $response["day3"] = "03";
        $response["day4"] = "04";
        $response["day5"] = "05";
        $response["day6"] = "06";
        $response["day7"] = "07";
        $response["day8"] = "08";
        $response["day9"] = "09";
        $response["day10"] = "10";
        $response["day11"] = "11";
        $response["day12"] = "12";
        $response["day13"] = "13";
        $response["day14"] = "14";
        $response["day15"] = "15";
        $response["day16"] = "16";
        $response["day17"] = "17";
        $response["day18"] = "18";
        $response["day19"] = "19";
        $response["day20"] = "20";
        $response["day21"] = "21";
        $response["day22"] = "22";
        $response["day23"] = "23";
        $response["day24"] = "24";
        $response["day25"] = "25";
        $response["day26"] = "26";
        $response["day27"] = "27";
        $response["day28"] = "28";
        $response["day29"] = "29";
    } else if (in_array($_GET["chn_month"], array("April", "June", "September", "November"))) {
        $response[""] = "- Day -";
        $response["day1"] = "01";
        $response["day2"] = "02";
        $response["day3"] = "03";
        $response["day4"] = "04";
        $response["day5"] = "05";
        $response["day6"] = "06";
        $response["day7"] = "07";
        $response["day8"] = "08";
        $response["day9"] = "09";
        $response["day10"] = "10";
        $response["day11"] = "11";
        $response["day12"] = "12";
        $response["day13"] = "13";
        $response["day14"] = "14";
        $response["day15"] = "15";
        $response["day16"] = "16";
        $response["day17"] = "17";
        $response["day18"] = "18";
        $response["day19"] = "19";
        $response["day20"] = "20";
        $response["day21"] = "21";
        $response["day22"] = "22";
        $response["day23"] = "23";
        $response["day24"] = "24";
        $response["day25"] = "25";
        $response["day26"] = "26";
        $response["day27"] = "27";
        $response["day28"] = "28";
        $response["day29"] = "29";
        $response["day30"] = "30";
    } else if (in_array($_GET["chn_month"], array("January", "March", "April", "May", "July", "August", "October", "December"))) {
        $response[""] = "- Day -";
        $response["day1"] = "01";
        $response["day2"] = "02";
        $response["day3"] = "03";
        $response["day4"] = "04";
        $response["day5"] = "05";
        $response["day6"] = "06";
        $response["day7"] = "07";
        $response["day8"] = "08";
        $response["day9"] = "09";
        $response["day10"] = "10";
        $response["day11"] = "11";
        $response["day12"] = "12";
        $response["day13"] = "13";
        $response["day14"] = "14";
        $response["day15"] = "15";
        $response["day16"] = "16";
        $response["day17"] = "17";
        $response["day18"] = "18";
        $response["day19"] = "19";
        $response["day20"] = "20";
        $response["day21"] = "21";
        $response["day22"] = "22";
        $response["day23"] = "23";
        $response["day24"] = "24";
        $response["day25"] = "25";
        $response["day26"] = "26";
        $response["day27"] = "27";
        $response["day28"] = "28";
        $response["day29"] = "29";
        $response["day30"] = "30";
        $response["day31"] = "31";
    }
}

if($response != '') {
    print json_encode($response);
}

?>