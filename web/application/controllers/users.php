<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Users extends CI_Controller {

	private function _redirect_page($method, $params = array()){
		if (method_exists($this, $method))
			return call_user_func_array(array($this, $method), $params);
		else
			show_404();
	}

	public function _remap($method, $params = array()){
		$this->load->model('user');
		$user = $this->user->load_user($params[0]);
		$user->name = $params[0];
		$params[0] = $user;
		if ($this->user->is_logged_in())
			$this->_redirect_page($method, $params);
	}

	public function index($user){
		if ($user->submitCount == 0) $user->rate = 0;
		else $user->rate = number_format($user->solvedCount / $user->submitCount * 100, 2);
		 
		if ($user->idSchool)
			$user->school = $this->user->load_school($user->idSchool);
			
		$user->rank = $this->user->load_rank($user->uid);
		
		$this->load->view('user/index', array('data' => $user));
	}
	
	function password_check($password){
		if ($this->input->post('new_password', TRUE) == '') return TRUE;
		$password = md5(md5($password) . $this->config->item('password_suffix'));
		return $this->user->password_check($this->session->userdata('username'), $password) != FALSE;
	}
	
	public function settings($user){
		$this->load->library('form_validation');
		$this->form_validation->set_error_delimiters('<span class="alert alert-error">', '</span>');
			
		$this->form_validation->set_rules('old_password', 'Old Password', 'callback_password_check');
		$this->form_validation->set_rules('show_category', 'Show Category', '');
		$this->form_validation->set_rules('email', 'Email', 'email');
		
		$this->form_validation->set_message('password_check', 'Wrong Old Password!');
		
		if ($this->form_validation->run() == FALSE){
			$config = $this->user->load_configuration($this->session->userdata('uid'));
			
			$this->load->view('user/settings', array('user' => $user, 'config' => $config));
		}else{
			$raw = $this->input->post(NULL, TRUE);
			$config = array();
			if (isset($raw['show_category'])) $config['showCategory'] = 1; else $config['showCategory'] = 0;
			if (isset($raw['email'])) $config['email'] = $raw['email'];
			$this->user->save_configuration($this->session->userdata('uid'), $config);
			if (isset($raw['old_password']) && isset($raw['new_password']) && $raw['old_password'] != '')
				$this->user->save_password($this->session->userdata('uid'), md5(md5($raw['new_password']) . $this->config->item('password_suffix')));
			
			$this->load->view('success');
		}
	}
} 