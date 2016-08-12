<?php
	header("Content-type:text/html; charset=utf-8");
	if ($_SERVER["REQUEST_METHOD"] == "POST"){
	include_once('simple_html_dom.php');
	//变量
	$link = "http://online.gxut.edu.cn/chengji/getScore.php";
	$link_withoutHeader = str_replace("http://", "", $link);
  $user = test_input($_POST["username"]);// 学号
  $password = test_input($_POST["password"]); // 密码
	$code = 0;// 状态码, 0：默认值； 1：获取成绩成功； -1：获取成绩失败
	// 创建一个cURL句柄
	$ch = curl_init($link);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
	// 检查是否有错误发生
	if(!curl_errno($ch))
	{
		$header = array(
			"Host:online.gxut.edu.cn",
			"Origin:http://online.gxut.edu.cn",
			"Content-Type:application/x-www-form-urlencoded",
			"Referer:http://online.gxut.edu.cn/chengji/",
			'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like <Gecko>	</Gecko>Chrome/49.0.2623.75 Safari/537.36'
			);
		$data = "username=$user&password=$password";

		$ret = curl_post($header, $data,$link);
		$html = getTd($ret);
        if(!$html){
          $code = -1;
        }else {
        	$code = 1;
        }
				$semester = 0;
				$grades = array();
				$grades[0][] = $code;
		foreach ($html as $key => $value) {
						if (($key-2)%14 == 0) {
							$semester = $value->plaintext;
						}
						if ($key%14 == 0) {
							$grades[0][1] = $value->plaintext;
						}
						if (($key-1)%14==0) {
							$grades[0][2] = $value->plaintext;
						}
            if($key%14!=0) //忽略学号
                if(($key-1)%14!=0) //忽略姓名
                    if (($key-4)%14!=0) //忽略类别
											if (($key-10)%14!=0)//忽略考试性质
                        if(($key+1)%14!=0)//忽略课程代码
                            if(($key+2)%14!=0)//忽略学时
			$grades[$semester][] = $value->plaintext;
		}
      echo json_encode($grades);
	}
	curl_close($ch);
}
	function getLoginCodeLink($html)
	{
		$ret = str_get_html($html);
		$linkStr = $ret->find('a', 0);
		$str = $linkStr->href;
		$str = str_replace("%2f", "/", $str);
		return $str;
	}

	function getTd($html)
	{
		$ret = str_get_html($html);
		$es = "";
		$es = $ret->find('table#gvcj1 td font');
		// $str = $es->innertext;
		return $es;
	}
	function test_input($data) {
	  $data = trim($data);
	  $data = stripslashes($data);
	  $data = htmlspecialchars($data);
	  return $data;
	}

	function curl_post($header,$data,$url)
	{
		$ch2 = curl_init();
		$res= curl_setopt ($ch2, CURLOPT_URL,$url);
		// var_dump($res);
		curl_setopt($ch2, CURLOPT_SSL_VERIFYHOST, FALSE);
		curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt ($ch2, CURLOPT_HEADER, 0);
		curl_setopt($ch2, CURLOPT_POST, 1);
		curl_setopt($ch2, CURLOPT_POSTFIELDS, $data);
		curl_setopt ($ch2, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch2,CURLOPT_HTTPHEADER,$header);
		$result = curl_exec ($ch2);
		curl_close($ch2);
		if ($result == NULL) {
			return 0;
		}
		return $result;
	}
 ?>
