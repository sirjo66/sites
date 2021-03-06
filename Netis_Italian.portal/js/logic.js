// 配置当前版本表单需要的数据（注：须根据不同版本配置）
var TableList = {
	//"test"				:['id','type','ip','mac'],
	'interface_list'		:['iface','iface_mode','st','sp','sg'],
	'statistics_list'		:['type','rx_pack','rx_bytes','tx_pack','tx_bytes'],
	'wps_list'				:['secmode','type','mode','key'],
	'wl_mac_filter_list'	:['id','mac_des','macaddr'],
	'reservation_list'		:['id','reserve_des','reserve_ip','reserve_mac'],
	'dhcp_client_list'		:['id','ip','mac','host','reserved','status'],
	'wl_link_ap0_list'		:['id','father','host','mac','tx_pack','rx_pack'],
	'wl_link_ap1_list'		:['id','father','host','mac','tx_pack','rx_pack'],
	'wl_link_ap2_list'		:['id','father','host','mac','tx_pack','rx_pack'],
	'wl_link_ap3_list'		:['id','father','host','mac','tx_pack','rx_pack'],
	'virtual_server_list'	:['id','vir_name','vir_ip','vir_proto','vir_outport','vir_inport'],
	'app_port_list'			:['id','app_name','trigger_proto','app_port','forward_proto','forward_port'],
	'ip_filter_list'		:['id','ip_describe','ip_rule','ip_source','ip_destination','ip_proto','ip_port','ip_day','ip_time'],
	'mac_filter_list'		:['id','mac_describe','mac_rule','mac_filter','mac_day','mac_time'],
	'dns_filter_list'		:['id','dns_des','dns_rule','dns_key','dns_day','dns_time'],
	'static_routing_list'	:['id','route_des','route_type','ip_value','mask_value','gateway_value'],
	'qos_rule_list'			:['id','qos_des','qos_status','qos_ip','qos_min_up','qos_min_down','qos_max_up','qos_max_down'],
	'binds_list'			:['id','binds_des','binds_ip','binds_mac','binds_port'],
	'arp_list'				:['id','arp_ip','arp_mac'],
	'ap_scan_list'			:['wl_ss_ssid','wl_ss_bssid','wl_ss_channel','wl_ss_mode','wl_ss_secmo','wl_ss_sin']
}

//  从CGI获取到参数后首先转换成页面需要的值。
function parameLogic(parame){
	var data = new Object();
	obj2obj(data,parame);
	//设置所有CGI返回的表单适应页面
	for(var i in TableList){
		var obj = new Array();
		if(!data[i]){continue;}
		for(var k=0;k<data[i].length;k++){
			obj[k] = {};
			for(var j in TableList[i]){
				var par = TableList[i][j];
				obj[k][par] = data[i][k][TableList[i][j]];
			}
		}
		data[i] = obj;
	}
	// 状态显示页面逻辑。
	if(data.conntype=='0'){			// 静态接入。
		data.ip   = data.wan_ip;
		data.mask = data.wan_mask;
		data.gw   = data.wan_gw;
	}else if(data.conntype=='6'||data.conntype=='9'){	// l2tp
		data.tmp_ip    = data.l2tp_ip;
		data.tmp_mk    = data.l2tp_mask;
		data.tmp_gw	   = data.l2tp_gw;
		data.l2tp_ip   = data.ip;
		data.l2tp_mask = data.mask;
		data.l2tp_gw   = data.gw;
		data.ip		   = (data.conntype=='6')?data.tmp_ip:data.second_ip;
		data.mask	   = (data.conntype=='6')?data.tmp_mk:data.second_mask;
		data.gw        = (data.conntype=='6')?data.tmp_gw:data.second_gw;
	}else if(data.conntype=='4'||data.conntype=='8'){	// pptp
		data.tmp_ip    = data.pptp_ip;
		data.tmp_mk    = data.pptp_mask;
		data.tmp_gw	   = data.pptp_gw;
		data.pptp_ip   = data.ip;
		data.pptp_mask = data.mask;
		data.pptp_gw   = data.gw;
		data.ip		   = (data.conntype=='4')?data.tmp_ip:data.second_ip;
		data.mask	   = (data.conntype=='4')?data.tmp_mk:data.second_mask;
		data.gw        = (data.conntype=='4')?data.tmp_gw:data.second_gw;
	}
	// 设置repeater逻辑。
	if(data.access_mode==2){
		data.net_mode = 0;		//如果WISP下网络模式始终设为AP.   
	}else{
		if(data.repeater_enable==1&&data.net_mode==0){data.net_mode=4;}
		if(data.NetModeFlag!=0){data.net_mode = data.NetModeFlag;}
	}
	// 设置QOS逻辑.
	if(data.qos_speed_up){data.qos_rule_up = data.qos_speed_up;}
	if(data.qos_speed_down){data.qos_rule_down = data.qos_speed_down;}
	// WAN口接入方式逻辑。 
	if(data.conntype=='12'){		// russia/maxis pppoe static逻辑
		if(data.tag_type==2){
			data.conntype = '8';
		}else{
			data.conntype = '4';
		}
		data.second_in_type = '1';
		data.second_ip = data.wan_ip;	// 状态显示页面逻辑。
		data.second_mask = data.wan_mask;
	}else if(data.conntype=='13'){	// russia/maxis pppoe dynamic逻辑
		if(data.tag_type==2){
			data.conntype = '8';
		}else{
			data.conntype = '4';
		}
		data.second_in_type = '0';
	}else if(data.conntype=='18'){	// unifi pppoe static逻辑
		data.conntype 	= '5';
		data.second_in_type = '1';
	}else if(data.conntype=='19'){	// unifi pppoe dynamic逻辑
		data.conntype 	= '5';
		data.second_in_type = '0';
	}else if(data.conntype=='6'){	// l2tp static逻辑
		data.conntype 	= '6';
		data.l2tp_type	= '1';
	}else if(data.conntype=='9'){	// l2tp dynamic逻辑
		data.conntype 	= '6';
		data.l2tp_type 	= '0';
	}else if(data.conntype=='4'){	// pptp static逻辑
		data.conntype 	= '7';
		data.pptp_type 	= '1';
	}else if(data.conntype=='8'){	// pptp dynamic逻辑
		data.conntype 	= '7';
		data.pptp_type 	= '0';
	}
	// 设置缺省无线加密repeater/client选择自动手动模式.
	if(data.wl_config=='0'){       	//00
		data.rp_config = '0';
		data.cl_config = '0';
	}else if(data.wl_config=='1'){	//01
		data.rp_config = '0';
		data.cl_config = '1';
	}else if(data.wl_config=='2'){	//10
		data.rp_config = '1';
		data.cl_config = '0';
	}else if(data.wl_config=='3'){	//11
		data.rp_config = '1';
		data.cl_config = '1';
	}	
	// 设置client模式逻辑。
	data.cl_sec_mode = (data.sec_mode=='4')?'0':data.sec_mode;
	data.cl_key_size = data.key_size;
	data.cl_key_type = data.key_type;
	data.cl_key_mode_wep = data.key_mode_wep;
	data.cl_key_mode_wpa = data.key_mode_wpa;
	data.cl_key_wep = data.key_wep;
	data.cl_key_wpa = data.key_wpa;
	//pptp server
	data.pptp_server = (data.pptp_server_ip)?data.pptp_server_ip:data.pptp_server_name;
	//l2tp server
	data.l2tp_server = (data.l2tp_server_ip)?data.l2tp_server_ip:data.l2tp_server_name;
	// passwd
	data.new_user = data.old_user;
	// 将所有副AP的接入都加入到主AP表单中。
	data.wl_link_ap0_list = JoinLists(data.wl_link_ap0_list,data.wl_link_ap1_list,data.wl_link_ap2_list,data.wl_link_ap3_list);
	// decode ssid
	//data.ssid = decodeURIComponent(data.ssid);
	return data;
}
//  逻辑显示设置。
function inLogic(n){
	set_bridge_logic(); //桥模式下
	change_wps_show();
	switch(n){
		case 'status':break;
		case 'lan':break;
		case 'wps':
			getPan(1).hide();
			break;
		case 'wan':
			getTag(0,0).panel[0].txt.entity.style.width="80px";
			getTag(0,0).panel[1].txt.entity.style.width="95px";
			var label_s = Language[$.Language].status.status.lan_ip_label+" :";
			getTag(4,1).label.entity.innerHTML = label_s;
			add_wep_wpa_after();
			time_disable();
			APCHAN = '0';
		break;
		case 'iptv':
			change_iptv_mode(getTag(0,0));
			if($.DataMap.conntype==5||$.DataMap.conntype==8){
				getTag(0,0).select.entity.options.length=1;
				getTag(0,0).select.checked(0);
			}else{
				getTag(0,0).select.entity.options.length=3;
			}
			break;
		case 'opmode':
		//	set_bridge_logic();
			break;
		case 'base':
			disableDom(getTagDom(2,'cl_key_auto','text'),APSCAN);
			disableDom(getTagDom(3,'rp_key_auto','text'),APSCAN);
			change_base_display();
			APCHAN = '0';
			break;
		case 'advance':break;
		case 'qos':
			change_qos_ip_sele();
			change_qos_list_show();
			change_qos_rule(getTag(0,0));			   
			break;
		case 'virtual':
			change_virtual_list_show();
			break;
		case 'portTrigger':
			change_portTrigger_list_show();
			break;
		case 'ip_filter':
			getTag(1,"ip_time").start.entity.options.length=48;
			change_ip_filter_list_show();
			change_ip_src_sele();
			change_ip_des_sele();
		    ip_disable_proto();
			break;
		case 'mac_filter':
			getTag(1,"mac_time").start.entity.options.length=48;
			change_mac_filter_list_show();
			break;
		case 'dns_filter':
			getTag(1,"dns_time").start.entity.options.length=48;
			change_dns_filter_list_show();
			break;
		case 'binds':
			change_binds_list_show();
			break;
		case 'arp_list':
			//change_arp_list_show();
			break;
		case 'routing':
			change_routing_list_show();
			break;
		case 'ddns':
			change_ddns_show();
			break;
		case 'sys_time':
			getTag(0,3).text_a.entity.maxLength = '2';
		    getTag(0,4).select.entity.style.width = "310px";
			show_sys_time();
			break;
		case 'default':
			//getPan(1).display='0';
			break;
		case 'reboot':
			//getPan(1).display='0';
			break;
	}
}
//  提交参数时补充逻辑设置。
function setLogic(parame){
	if(parame.language&&getLen(parame)==1){return parame;} // 只提交语言时不作逻辑判断。
	var obj = new Object;
	switch($.CurrentApp){
		case 'status':break;
		case 'Welcome':
			if(parame.conntype==0||parame.conntype==1||parame.conntype==3){obj.wan_set = '1';}// 模块参数
			obj.access_mode = '0';
			obj.wl_base_set = 'ap'; 			// 模块参数
			obj.net_mode = '0';		
			obj.NetModeFlag = '0';
			obj.wl_sec_set = 'ap';				// 模块参数
			obj.dhcp_enable = '1';
			obj.repeater_enable = '0';
			obj.rp_wl_enable = '0';
			if($.DataMap.wl_enable=='0'){obj.wl_enable = '1';}
			obj.wl_mac = $.DataMap.wl_mac;
			obj.mac_addr = $.DataMap.mac_default;
			break;
		case 'wan':
			obj.wan_set = '1';					// 模块参数
			if(parame.mac_addr){obj.mac_clone_set = '1';}
			if(parame.access_mode==2){			//开启WISP模式时 
				obj.wl_sec_set = 'repeater';	// 模块参数  
				obj.wl_base_set = 'ap';			// 模块参数
				if($.DataMap.wl_enable=='0'){obj.wl_enable = '1';}
				obj.net_mode = '0';				//WISP模式下网络模式设为AP 
				obj.NetModeFlag = '0';
				obj.repeater_enable = '1';		//开启repeater
				obj.rp_wl_enable = '1'; 		//开启repeater无线使能 
				obj.rp_net_mode = '3';			//为客户模式 
				obj.channel_width = '0';		//频宽为20M 
				//obj.dhcp_enable = '0';		//repeater模式下关闭DHCP.
				obj.channel = (APCHAN!='0')?APCHAN:$.DataMap.channel;
				obj.repeater_mac = (APMAC!= '')?APMAC:"00:00:00:00:00:00";
				set_wan_ap_scan_logic(parame,obj);
			}else{
				if($.DataMap.net_mode=="0"||$.DataMap.net_mode=="3"||$.DataMap.net_mode=="5"){
					obj.repeater_enable = '0';
					obj.rp_wl_enable = '0';
					//obj.dhcp_enable = '1';		//非repeater模式下开启DHCP.
				}
			}
			// russia pppoe
			if((parame.conntype=='4'||parame.conntype=='8')&&parame.second_in_type=='1'){
				obj.conntype = '12';
			}else if((parame.conntype=='4'||parame.conntype=='8')&&parame.second_in_type=='0'){
				obj.conntype = '13';
			}
			// unifi pppoe
			if(parame.conntype=='5'&&parame.second_in_type=='1'){
				obj.conntype = '18';
			}else if(parame.conntype=='5'&&parame.second_in_type=='0'){
				obj.conntype = '19';
			}
			// l2tp
			if(parame.conntype=='6'&&parame.l2tp_type=='1'){
				obj.conntype = '6';
			}else if(parame.conntype=='6'&&parame.l2tp_type=='0'){
				obj.conntype = '9';
			}
			// l2tp server
			if(parame.conntype=='6'){
				if(is_ip(parame.l2tp_server)){
					obj.l2tp_server_ip = parame.l2tp_server;
					obj.l2tp_server_name = '';
				}else{
					obj.l2tp_server_name = parame.l2tp_server;
					obj.l2tp_server_ip = '';
				}
			}
			// pptp
			if(parame.conntype=='7'&&parame.pptp_type=='1'){
				obj.conntype = '4';
			}else if(parame.conntype=='7'&&parame.pptp_type=='0'){
				obj.conntype = '8';
			}
			// pptp server 
			if(parame.conntype=='7'){
				if(is_ip(parame.pptp_server)){
					obj.pptp_server_ip = parame.pptp_server;
					obj.pptp_server_name = '';
				}else{
					obj.pptp_server_name = parame.pptp_server;
					obj.pptp_server_ip = '';
				}
			}
			if((parame.conntype=='3'||parame.conntype=='4'||parame.conntype=='5')&&parame.ppp_connect_mode=='1'){
				obj.ppp_time = ID('ppp_time').value;
			}
			if(parame.conntype=='6'&&parame.l2tp_connect_mode=='1'){
				obj.l2tp_time = ID('l2tp_time').value;
			}
			if(parame.conntype=='7'&&parame.pptp_connect_mode=='1'){
				obj.pptp_time = ID('pptp_time').value;
			}
			set_vlan_tag(parame,obj);
			setwpsLogic(parame);
			break;
		case 'lan':
			if(parame.dhcp_enable){
				obj.dhcp_server_set = '1';		// 模块参数
			}else{
				obj.reserve_address_set = '1';	// 模块参数
			}
			break;
		case 'iptv':
			obj.iptv_type_set = '1';			// 模块参数
			obj.igmp_set = '1';                 // 模块参数
			obj.igmp_enable = (parame.iptv_mode=="0")?"1":"0";
			break;
		case 'address_reservation':
			obj.reserve_address_set = '1'; 
			break;
		case 'opmode':
			obj.wan_set = '1';                  // 模块参数
			obj.dhcp_enable = (parame.access_mode=="0")?"1":"0";
			break;
		case 'base':
			obj.wl_base_set = 'ap'; 			// 模块参数
			obj.NetModeFlag=(parame.net_mode==5||parame.net_mode==6)?parame.net_mode:'0';
			if(parame.net_mode==5)
				parame.net_mode = 3;
			else if(parame.net_mode==6)
				parame.net_mode = 4;
			if(parame.net_mode==0||parame.net_mode==2||parame.net_mode==3){obj.wl_sec_set = 'ap';}
			if(parame.net_mode==3){
				obj.ssid = parame.repeater_ssid;
				obj.dhcp_enable = '0';			//client模式下关闭DHCP.
				obj.channel = (APCHAN!='0')?APCHAN:$.DataMap.channel;
			}
			if(parame.net_mode==1||parame.net_mode==2){	//WDS模式下添加WDS表单。 
				obj.wds_sec_set = 'ap';			// 模块参数
				obj.wds_set='ap';				// 模块参数
				obj.wds_enable = '1';			//开启WDS表单。
				obj.id1 = '1';
				obj.wds_name1 = parame.repeater_ssid;
				obj.wds_mac1  = parame.repeater_mac;
			}else{
				obj.wds_set = 'ap';				// 模块参数
				obj.wds_enable = '0';			//关闭WDS表单。 
			}
			if(parame.net_mode==4||parame.net_mode==6){	//AP+Client其实就是repeater模式。 
				obj.wl_sec_rp_set = 'ap';		// 模块参数 (repeater和ap无线模块同时保存时提交)   
				obj.wl_sec_set = 'repeater';	// 模块参数 
				obj.net_mode = '0';
				obj.repeater_enable = '1';
				obj.rp_net_mode = '3';
				obj.dhcp_enable = '0';			//repeater模式下关闭DHCP.
				obj.channel = (APCHAN!='0')?APCHAN:((obj.NetModeFlag==6)?parame.channel:$.DataMap.channel);
				obj.repeater_mac = (APMAC!= '')?APMAC:"00:00:00:00:00:00";
				//Repeater模式下将本地AP的无线加密修改为和上端无线加密一致。
				if(obj.NetModeFlag!='6'){
				obj.ssid = parame.repeater_ssid;//将本地AP的SSID修改为和上端SSID一致。     
				obj.sec_mode = parame.rp_sec_mode;
				if(parame.rp_key_wep){obj.key_wep = parame.rp_key_wep;}
				if(parame.rp_key_size){obj.key_size = parame.rp_key_size;}
				if(parame.rp_key_mode_wep){obj.key_mode_wep = parame.rp_key_mode_wep;}
				if(parame.rp_key_type){obj.key_type = parame.rp_key_type;}
				if(parame.rp_key_mode_wpa){obj.key_mode_wpa = parame.rp_key_mode_wpa;}
				if(parame.rp_key_wpa){obj.key_wpa = parame.rp_key_wpa;}}
			}	
			if(parame.net_mode!=3&&parame.net_mode!=4&&parame.net_mode!=5&&parame.net_mode!=6){obj.dhcp_enable = '1';}//非client、repeater模式下开启DHCP.
			if(parame.net_mode!=4&&parame.net_mode!=6&&$.DataMap.repeater_enable==1&&$.DataMap.access_mode!=2){obj.repeater_enable=0;}//非repeater模式下(非WISP)关闭repeater_enable.  
			//obj.ssid = trim(getTag(0,'ssid').text.entity.value);
			if(parame.sec_mode=='1'){			//在开启WEP加密时，关闭WPS功能。
				if($.DataMap.wps_enable=='1'){
					obj.wps_set = 'ap';			// 模块参数
					obj.wps_enable = '0';
					obj.wps_mode = 'enable';
				}
			}
			// Client模式下的自动模式逻辑。
			if((parame.net_mode=='3'||parame.net_mode=='5')&&parame.cl_config=='0'){
				if(!parame.cl_key_auto){
					obj.sec_mode = '0';
				}else if(APSEC=='WEP'){
					obj.sec_mode = '1';
					obj.key_wep = parame.cl_key_auto;
					if(parame.cl_key_auto.length=='5'){
						obj.key_size = '0';
						obj.key_mode_wep = '1';			
					}else if(parame.cl_key_auto.length=='10'){
						obj.key_size = '0';
						obj.key_mode_wep = '0';
					}else if(parame.cl_key_auto.length=='13'){
						obj.key_size = '1';
						obj.key_mode_wep = '1';
					}else if(parame.cl_key_auto.length=='26'){
						obj.key_size = '1';
						obj.key_mode_wep = '0';
					}
				}else if(APSEC=='WPA'||APSEC=='WPA-PSK'){
					obj.sec_mode = '2';
					obj.key_type = (APTYPE=='3')?'2':APTYPE;
					obj.key_mode_wpa = (parame.cl_key_auto.length != '64')?'1':'0';
					obj.key_wpa = parame.cl_key_auto;
				}else if(APSEC=='WPA2'||APSEC=='WPA2-PSK'||APSEC=='WPA/WPA2'||APSEC=='WPA-PSK/WPA2'||APSEC=='WPA-PSK/WPA2-PSK'){
					obj.sec_mode = '3';
					obj.key_type = (APTYPE=='3')?'2':APTYPE;
					obj.key_mode_wpa = (parame.cl_key_auto.length != '64')?'1':'0';
					obj.key_wpa = parame.cl_key_auto;
				}
			}
			// Repeater模式下的自动模式逻辑。
			if((parame.net_mode=='4'||parame.net_mode=='6')&&parame.rp_config=='0'){
				if(!parame.rp_key_auto){
					obj.rp_sec_mode = '0';
				}else if(APSEC=='WEP'){
					obj.rp_sec_mode = '1';
					obj.rp_key_wep = parame.rp_key_auto;
					if(parame.rp_key_auto.length=='5'){
						obj.rp_key_size = '0';
						obj.rp_key_mode_wep = '1';			
					}else if(parame.rp_key_auto.length=='10'){
						obj.rp_key_size = '0';
						obj.rp_key_mode_wep = '0';
					}else if(parame.rp_key_auto.length=='13'){
						obj.rp_key_size = '1';
						obj.rp_key_mode_wep = '1';
					}else if(parame.rp_key_auto.length=='26'){
						obj.rp_key_size = '1';
						obj.rp_key_mode_wep = '0';
					}
				}else if(APSEC=='WPA'||APSEC=='WPA-PSK'){
					obj.rp_sec_mode = '2';
					obj.rp_key_type = (APTYPE=='3')?'2':APTYPE;
					obj.rp_key_mode_wpa = (parame.rp_key_auto.length != '64')?'1':'0';
					obj.rp_key_wpa = parame.rp_key_auto;
				}else if(APSEC=='WPA2'||APSEC=='WPA2-PSK'||APSEC=='WPA/WPA2'||APSEC=='WPA-PSK/WPA2'||APSEC=='WPA-PSK/WPA2-PSK'){
					obj.rp_sec_mode = '3';
					obj.rp_key_type = (APTYPE=='3')?'2':APTYPE;
					obj.rp_key_mode_wpa = (parame.rp_key_auto.length != '64')?'1':'0';
					obj.rp_key_wpa = parame.rp_key_auto;
				}
				//Repeater模式下将本地AP的无线加密修改为和上端无线加密一致。
				if(obj.NetModeFlag!='6'){
				obj.sec_mode = obj.rp_sec_mode;
				if(obj.rp_key_wep){obj.key_wep = obj.rp_key_wep;}
				if(obj.rp_key_size){obj.key_size = obj.rp_key_size;}
				if(obj.rp_key_mode_wep){obj.key_mode_wep = obj.rp_key_mode_wep;}
				if(obj.rp_key_type){obj.key_type = obj.rp_key_type;}
				if(obj.rp_key_mode_wpa){obj.key_mode_wpa = obj.rp_key_mode_wpa;}
				if(obj.rp_key_wpa){obj.key_wpa = obj.rp_key_wpa;}}
			}
			// wl_config 逻辑 (用这一个参数保存rp_config和cl_config).
			if(parame.rp_config && parame.rp_config=='0'){
				obj.wl_config = ($.DataMap.wl_config=='0')?'0':'1';
			}else if(parame.rp_config && parame.rp_config=='1'){
				obj.wl_config = ($.DataMap.wl_config=='2')?'2':'3';
				//obj.sec_mode = parame.rp_sec_mode;
			}
			if(parame.cl_config && parame.cl_config=='0'){
				obj.wl_config = ($.DataMap.wl_config=='0')?'0':'2';
			}else if(parame.cl_config && parame.cl_config=='1'){
				obj.wl_config = ($.DataMap.wl_config=='1')?'1':'3';
			}
			// 改变client无线加密的参数，请放在最后。  
			if(parame.net_mode==3||parame.net_mode==5)
				parame = change_client_parame(parame);
			setwpsLogic(parame);
			break;
		case 'wl_mac_filter':
			if(parame.wl_mac_filter_rule){
				obj.wl_mac_filter_arg = 'ap';			// 模块参数
				obj.wlan_idx_num = '0'; 			
			}else{
				obj.wl_mac_filter_set = 'ap';			// 模块参数
			}
			break;
		case 'wds':
			obj.wds_set = 'ap'; 						// 模块参数
			break;
		case 'wps':	
			obj.wps_set = 'ap';							// 模块参数
			obj.wlan_idx_num = '0';
			break;
		case 'multiple_ssid':
			var t = getTag(0,'multiple_sele').select.entity.value;
			obj.wl_base_set = 'ap'+t;					// 模块参数
			obj.wl_sec_set = 'ap'+t;					// 模块参数
			parame = change_ap_parame(parame,'1',t);
			break;
		case 'advance':
			obj.wl_advanced_set = 'ap';					// 模块参数
			setwpsLogic(parame);
			break;
		case 'list':break;
		case 'qos':
			if(parame.qos_enable){
				obj.qos_arg_set = '1';					// 模块参数
				obj.qos_up_rule = '0';
				obj.qos_down_rule = '0';
			}else
				obj.qos_set = '1';						// 模块参数
			break;
		case 'virtual':
			obj.vir_server_set = '1'; 					// 模块参数
			break;
		case 'dmz':
			if(parame.dmz_enable){obj.dmz_set = '1';} 	// 模块参数
			if(parame.super_dmz_enable){obj.super_dmz_set = '1';}// 模块参数
			if(parame.dmz_enable=='1'&& $.DataMap.super_dmz_enable=='1'){
				obj.super_dmz_set = '1'; 				// 模块参数
				obj.super_dmz_enable = '0';
			}
			if(parame.super_dmz_enable=='1' && $.DataMap.dmz_enable=='1'){
				obj.dmz_set = '1';						// 模块参数
				obj.dmz_enable = '0';
			}
			break;
		case 'upnp':
			obj.upnp_set = '1'; 						// 模块参数
			break;
		case 'portTrigger':
			obj.port_trigger_set = '1';					// 模块参数
			break;
		case 'ftp':
			obj.ftp_set = '1';							// 模块参数
			break;
		case 'ip_filter':
			if(parame.ip_filter_enable){
				obj.ip_filter_arg_set = '1';			// 模块参数
			}else{
				obj.ip_filter_set = '1';				// 模块参数
			}
			setPortAll(parame);
			break;
		case 'mac_filter':
			if(parame.mac_filter_enable){
				obj.mac_filter_arg_set = '1';			// 模块参数
			}else{
				obj.mac_filter_set = '1';				// 模块参数
			}
			break;
		case 'dns_filter':
			if(parame.dns_filter_enable){
				obj.dns_filter_arg_set = '1';			// 模块参数
			}else{
				obj.dns_filter_set = '1';				// 模块参数
			}
			break;
		case 'port_filter':
			break;
		case 'ddns':
			obj.ddns_set = '1'; 						// 模块参数
			break;
		case 'binds':
			if(parame.binds_rule){
				obj.bind_arg_set = '1';					// 模块参数
			}else{
				obj.bind_set = '1';						// 模块参数
			}
			break;
		case 'arp_list':
			obj.bind_set = '1';							// 模块参数
			break;
		case 'routing':
			if(parame.route_type1=='HOST'){
				obj.mask_value1 = '255.255.255.255';
			}
			obj.static_route_set = '1';					// 模块参数
			break;
		case 'interface_mode':
			obj.interface_mode_set = '1'; 				// 模块参数
			break;
		case 'igmp':
			obj.igmp_set = '1'; 						// 模块参数
			break;
		case 'vpn':
			obj.vpn_arg_set = '1';						// 模块参数
			break;
		case 'wakeup':
			obj.wakeup_set = '1'; 						// 模块参数
			break;
		case 'remote':
			obj.remote_port_set = '1'; 					// 模块参数
			break;
		case 'passwd':
			if(!parame.old_pwd){obj.old_pwd='';}
			obj.passwd_set = '1';						// 模块参数
			break;
		case 'update':break;
		case 'backup':break;
		case 'diagnostic':
			obj.tools_cmd = (tools_cmd=='0')?'1':'0';
			obj.net_tools_set = '1';					// 模块参数
			obj.wlan_idx_num = '0';
			break;
		case 'sys_time':
			obj.time_set = '1';							// 模块参数
			if(parame.time_server){obj.time_type = $.DataMap.time_type;}
			break;
		case 'sys_log':
			obj.log_set = '1';							// 模块参数
			break;
		case 'default':
			obj.default_set = '1';						// 模块参数
			obj.redefault = '1';
			obj.reboot_set = '1';						// 模块参数
			obj.reboot = '1';
			break;
		case 'reboot':
			if(parame.lan_ip){
				obj.lan_ip_set = '1';					// 模块参数
				setLanLogic(parame);
			}
			obj.reboot_set = '1';						// 模块参数
			obj.reboot = '1';
			break;
	}
	obj2obj(parame,obj);
	return parame;
}
function setTableLogic(parame){
	switch($.CurrentApp){
		case 'ip_filter':break;
	}
}
function getParame(obj){
	var str = '';
	for(var i in obj){
		str += i + ',';
	}
	str = str.substring(0,str.length-1);
	return str;
}
// 改变LAN口IP地址时的逻辑设置。   
function setLanLogic(parame){
	var tmp_mask;
	var now_ip = parame.lan_ip;
	var old_ip = $.DataMap.lan_ip;
	var now_mask = parame.lan_mask;
	var old_mask = $.DataMap.lan_mask;
	if(parseInt(GetIP(now_mask),2)>=parseInt(GetIP(old_mask),2)){
		tmp_mask = now_mask;
	}else{
		tmp_mask = old_mask;
	}
	if(AND(GetIP(now_ip),GetIP(tmp_mask))==AND(GetIP(old_ip),GetIP(tmp_mask))){return;}
	// 改变保留地址链表中的IP和LAN口IP同网段 .
	var list = $.DataMap.reservation_list;
	for(var i=0;i<list.length;i++){
		var tmp_ip = list[i].reserve_ip;
		var res_ip = NtoH(OR(AND(GetIP(now_ip),GetIP(tmp_mask)),AND(GetIP(tmp_ip),NOT(GetIP(tmp_mask)))));
		list[i].reserve_ip = res_ip;
		for(var j in list[i]){
			parame[j+i] = list[i][j];
		}
	}
	if(list.length){parame.reserve_address_set = '1';}
	// 改变地址池中的IP地址和LAN口IP同网段 。
	var dhcp_s = NtoH(OR(AND(GetIP(now_ip),GetIP(now_mask)),AND(GetIP($.DataMap.dhcp_start_ip),NOT(GetIP(now_mask)))));
	var dhcp_e = NtoH(OR(AND(GetIP(now_ip),GetIP(now_mask)),AND(GetIP($.DataMap.dhcp_end_ip),NOT(GetIP(now_mask)))));
	if(parseInt(GetIP(dhcp_s),2)>parseInt(GetIP(dhcp_e),2)){  					  // 算出的开始IP大于结束IP时。  
		dhcp_s = NtoH(OR(AND(GetIP(now_ip),GetIP(now_mask)),GetIP("0.0.0.2")));	  //地址池缺省主机号IP。  
		dhcp_e = NtoH(OR(AND(GetIP(now_ip),GetIP(now_mask)),GetIP("0.0.0.254"))); //这两个值会根据版本变化。
	}
	parame.dhcp_start_ip = dhcp_s;
	parame.dhcp_end_ip = dhcp_e;
	parame.dhcp_server_set = '1';
}

/************************************* 改变表单显示内容 *************************************/
function change_dhcp_list_show(){
	var show = getTag(2,0).tab.tbody.Rows;
	for(var i=0;i<show.length;i++){
	    var data = show[i].data;
	    show[i].entity.cells[4].innerHTML = (data.reserved=='Dynamic')?$.CommonLan['no']:$.CommonLan['yes'];
	    show[i].entity.cells[5].innerHTML = (data.status==1)?$.CommonLan['online']:$.CommonLan['offline'];
	}
}

function change_qos_list_show(){
	var show = getTag(2,0).tab.tbody.Rows;
	var list = $.AllData.qos_rule_list;
	for(var i=0;i<show.length;i++){
	    var data = show[i].data;
		for(var j=0;j<list.length;j++){
			if(data.id==list[j].id){
	    		show[i].entity.cells[2].innerHTML = (data.qos_status==0)?$.CommonLan['off']:$.CommonLan['on'];
	    		show[i].entity.cells[3].innerHTML = getHostIP(list[j],'qos_sele');
	    		if(data.qos_min_up==0){show[i].entity.cells[4].innerHTML = $.CommonLan['auto_type'];}
	    		if(data.qos_min_down==0){show[i].entity.cells[5].innerHTML = $.CommonLan['auto_type'];}
	    		if(data.qos_max_up==0){show[i].entity.cells[6].innerHTML = $.CommonLan['auto_type'];}
	    		if(data.qos_max_down==0){show[i].entity.cells[7].innerHTML = $.CommonLan['auto_type'];}
			}
		}
	}
}
var proto_map = {'1':'TCP','2':'UDP',3:'ALL',4:'ICMP',5:'TCPUDP'};
function change_virtual_list_show(){
	var show = getTag(1,0).tab.tbody.Rows;
	var list = $.AllData.virtual_server_list;
	for(var i=0;i<show.length;i++){
		var data = list[parseInt(show[i].data.id)-1];
	    show[i].entity.cells[3].innerHTML = (data.vir_proto=='3')?$.CommonLan['all']:proto_map[data.vir_proto];
	    show[i].entity.cells[4].innerHTML = data.vir_outport_start+'-'+data.vir_outport_end;
	    show[i].entity.cells[5].innerHTML = data.vir_inport_start+'-'+data.vir_inport_end;
	}
}

function change_portTrigger_list_show(){
	var show = getTag(1,0).tab.tbody.Rows;
	var list = $.AllData.app_port_list;
	for(var i=0;i<show.length;i++){
	    var data = list[parseInt(show[i].data.id)-1];
	    show[i].entity.cells[2].innerHTML = (data.trigger_proto=='3')?$.CommonLan['all']:proto_map[data.trigger_proto];
	    show[i].entity.cells[3].innerHTML = data.app_port_start+'-'+data.app_port_end;
	    show[i].entity.cells[4].innerHTML = (data.forward_proto=='3')?$.CommonLan['all']:proto_map[data.forward_proto];
	    show[i].entity.cells[5].innerHTML = data.forward_port_start+'-'+data.forward_port_end;
	}
}

function change_ip_filter_list_show(){
	var show = getTag(2,0).tab.tbody.Rows;
	var list = $.AllData.ip_filter_list;
	for(var i=0;i<show.length;i++){
	    var data = show[i].data;
		for(var j=0;j<list.length;j++){
			if(data.id==list[j].id){
			    show[i].entity.cells[2].innerHTML = (list[j].ip_rule==0)?$.CommonLan['forbid_s']:$.CommonLan['allow_s'];
			    show[i].entity.cells[3].innerHTML = getHostIP(list[j],'ip_src_sele');
			    show[i].entity.cells[4].innerHTML = getHostIP(list[j],'ip_des_sele');
			    show[i].entity.cells[5].innerHTML = (list[j].ip_proto=='3')?$.CommonLan['all']:proto_map[data.ip_proto];
				var ports = (list[j].ip_port_start)?(list[j].ip_port_start+'-'+list[j].ip_port_end):'None';
			    show[i].entity.cells[6].innerHTML = ports;
			    show[i].entity.cells[7].innerHTML = getWeekShow(list[j].ip_day);
			    show[i].entity.cells[8].innerHTML = (list[j].ip_time=='all')?$.CommonLan['all']:list[j].ip_time;
			}
		}
	}
}

function change_mac_filter_list_show(){
	var show = getTag(2,0).tab.tbody.Rows;
	for(var i=0;i<show.length;i++){
	    var data = show[i].data;
	    show[i].entity.cells[2].innerHTML = (data.mac_rule==0)?$.CommonLan['forbid_s']:$.CommonLan['allow_s'];
		show[i].entity.cells[4].innerHTML = getWeekShow(data.mac_day);
		show[i].entity.cells[5].innerHTML = (data.mac_time=='all')?$.CommonLan['all']:data.mac_time;
	}
}

function change_dns_filter_list_show(){
	var show = getTag(2,0).tab.tbody.Rows;
	for(var i=0;i<show.length;i++){
	    var data = show[i].data;
	    show[i].entity.cells[2].innerHTML = (data.dns_rule==0)?$.CommonLan['forbid_s']:$.CommonLan['allow_s'];
		show[i].entity.cells[4].innerHTML = getWeekShow(data.dns_day);
		show[i].entity.cells[5].innerHTML = (data.dns_time=='all')?$.CommonLan['all']:data.dns_time;
	}
}
function change_binds_list_show(){
	var show = getTag(2,0).tab.tbody.Rows;
	for(var i=0;i<show.length;i++){
	    var data = show[i].data;
	    show[i].entity.cells[4].innerHTML = (data.binds_port==0)?'LAN':'WAN';
	}
}
function change_arp_list_show(){
	var show = getTag(0,0).tab.tbody.Rows;
	for(var i=0;i<show.length;i++){
	    var data = show[i].data;
	    show[i].entity.cells[3].innerHTML = (data.arp_st=='0x6')?$.CommonLan['bound']:$.CommonLan['unbound'];
	}
}
function change_routing_list_show(){
	var show = getTag(1,0).tab.tbody.Rows;
	for(var i=0;i<show.length;i++){
	    var data = show[i].data;
		var arr = eval("("+Language[$.Lan_map[$.DataMap.language]].advanced.routing.route_type_options +")");
	    show[i].entity.cells[2].innerHTML = (data.route_type=='NET')?arr[0]:arr[1];
	}
}

var sele_map = {
	'qos_sele'		:{start:'qos_ip_start',end:'qos_ip_end'},
	'ip_src_sele'	:{start:'ip_src_start',end:'ip_src_end'},
	'ip_des_sele'	:{start:'ip_des_start',end:'ip_des_end'}
};
function getHostIP(list,sele){
	var value = '';
	if(list[sele]=='all'){
		value = $.CommonLan['all'];
	}else if(list[sele]=='sub_host'){
		var subnet = NtoH(TtoB((parseInt(GetIP(list[sele_map[sele].start]),2)-1)));
		var mask = get_mask_by_ip(list[sele_map[sele].start],list[sele_map[sele].end]);
		value = subnet+'<br>/'+mask;
	}else{
		value = list[sele_map[sele].start]+'<br>/'+list[sele_map[sele].end];
	}
	return value;
}
//  改变无线client模式下提交的参数。 
function change_client_parame(parame){
	var par = new Object();
	for(var i in parame){
	    if(i.indexOf("cl_")!=-1&&i!='cl_config'){
	        var now = i.replace("cl_","");
	        par[now] = parame[i];
	    }else{
	        par[i] = parame[i];
	    }
	}
	return par;
}
//  改变副AP参数在显示和提交时的装换。 
function change_ap_parame(parame,f,t){
	var from = "ap"+f+"_";
	var to 	 = "ap"+t+"_";
	var par = new Object();
	for(var i in parame){
	    if(i.indexOf(from)!=-1){
	        var now = i.replace(from,to);
	        par[now] = parame[i];
	    }else{
	        par[i] = parame[i];
	    }
	}
	return par;
}

function change_wps_show(){
	var flag = ($.DataMap.sec_mode=='1')?'none':'block';
	ID("c_menu_wps").style.display = flag;
}
function set_auto_key(parame,obj){
	if(parame.net_mode=='3'&&parame.cl_config=='0'){
		if(!parame.key_auto){
			obj.sec_mode = '0';
		}else if(APSEC=='WEP'){
			obj.sec_mode = '1';
			if(parame.key_auto.length=='5'){
				obj.key_size = '0';
				obj.key_mode_wep = '1';			
			}else if(parame.key_auto.length=='10'){
				obj.key_size = '0';
				obj.key_mode_wep = '0';
			}else if(parame.key_auto.length=='13'){
				obj.key_size = '1';
				obj.key_mode_wep = '1';
			}else if(parame.key_auto.length=='26'){
				obj.key_size = '1';
				obj.key_mode_wep = '0';
			}
		}else if(APSEC=='WPA'||APSEC=='WPA-PSK'){
			obj.sec_mode = '2';
			if(parame.key_auto.length != '64'){
				obj.key_type = '';
				obj.key_mode_wpa = '1';
			}else{
				obj.key_type = '';
				obj.key_mode_wpa = '0';
			}
		}else if(APSEC=='WPA2'||APSEC=='WPA2-PSK'){
			obj.sec_mode = '3';
		}else if(APSEC=='WPA/WPA2'||APSEC=='WPA-PSK/WPA2'){
			obj.sec_mode = '4';
		}
	}
}
var week_map={'Sun':'week_0','Mon':'week_1','Tue':'week_2','Wed':'week_3','Thu':'week_4','Fri':'week_5','Sat':'week_6'};
function getWeekShow(data){
	if(data=='all'){return $.CommonLan['all'];}
	var arr = rtrim(data).split(' ');
	var week = '';
	for(var i=0;i<arr.length;i++){
		week += $.CommonLan[week_map[arr[i]]] + ' ';
	}
	return rtrim(week);
}

// 解决当选协议为ALL的时候开始和结束端口为0的情况。 
function setPortAll(parame){
	var list = $.DataMap.ip_filter_list;
	if(!list.length&&parame['ip_proto1']=='3'){
		parame['ip_port_start1'] = '1';
		parame['ip_port_end1'] = '65535';
	}else{
		for(var i=0;i<list.length;i++){
			var id = i + 1;
			if(parame['ip_proto'+id]=='3'){
				parame['ip_port_start'+id] = '1';
				parame['ip_port_end'+id] = '65535';
			}
		}
	}
}
/*
wsc_auth(WSC_AUTH_OPEN=1, WSC_AUTH_WPAPSK=2, WSC_AUTH_SHARED=4, WSC_AUTH_WPA=8, WSC_AUTH_WPA2=16(0x10), WSC_AUTH_WPA2PSK=32(0x20),WSC_AUTH_WPA2PSKMIXED=34(0x22))
wsc_enc(WSC_ENCRYPT_NONE=1, WSC_ENCRYPT_WEP=2, WSC_ENCRYPT_TKIP=4, WSC_ENCRYPT_AES=8, WSC_ENCRYPT_TKIPAES=12) 
*/
// WPS逻辑设置。
function setwpsLogic(parame){
	parame.wsc_config = '1';	// 模块参数。
	if($.CurrentApp=='wan'){
		if(parame.conntype != $.DataMap.conntype){
			parame.wsc_ssid = $.DataMap.ssid;
		}
	}else if($.CurrentApp=='base'){
		if(parame.sec_mode=='0'){
			parame.wsc_auth = '1';
			parame.wsc_enc	= '1';
		}else if(parame.sec_mode=='1'){
			if(parame.auth_type=='1'||parame.auth_type=='2'){
				parame.wsc_auth = '1';
			}else{
				parame.wsc_auth = '4';
			}
			parame.wsc_enc	= '2';
		}else if(parame.sec_mode=='2'||parame.sec_mode=='3'){
			parame.wsc_auth = (parame.sec_mode=='2')?'2':'32';
			if(parame.key_type=='1'){
				parame.wsc_enc = '4';
			}else if(parame.key_type=='2'){
				parame.wsc_enc = '8';
			}else{
				parame.wsc_enc = '12';
			}
			if($.DataMap.wpa_auth=='2'){
				parame.wsc_psk = parame.key_wpa;
			}
		}else if(parame.sec_mode=='4'){
			parame.wsc_auth = '34';
			parame.wsc_enc	= '12';
			if($.DataMap.wpa_auth=='2'){
				parame.wsc_psk = parame.key_wpa;
			}
		}
		if(parame.ssid != $.DataMap.ssid){
			parame.wsc_ssid = parame.ssid;
		}
	}else if($.CurrentApp=='advance'){
		if($.DataMap.sec_mode == '1'/*&&parame.auth_type != $.DataMap.auth_type*/){ //当页面有auth_type时取消注释。 
			if(parame.auth_type=='1'||parame.auth_type=='2'){
				if($.DataMap.auth_type=='3')
					parame.wsc_auth = '2';
			}else{
				if($.DataMap.auth_type=='1'||$.DataMap.auth_type=='2')
					parame.wsc_auth = '3';
			}
		}
	}
	parame.wsc_config_by_ext_reg = '0';
  	if($.DataMap.wsc_configured=='0' && $.DataMap.wsc_disable=='0'){
		parame.wsc_configured = '1';
	}
}

// 将多个表单合并在一起。（表单个数不限） 
function JoinLists(list_a,list_b,list_c,list_d){
	var tmpList = new Array();
	if(!list_a){return tmpList;}
	obj2obj(tmpList,arguments[0]);
	for(var m=1;m<arguments.length;m++){
		var more = 0;
		if(!arguments[m]||arguments[m].length==0){continue;}
		for(var i=0;i<arguments[m].length;i++){
			if(arguments[m].length>1){more++;}
			var obj = new Object();
			var new_id = (more)?(parseInt(tmpList.length+1)):(parseInt(tmpList.length+1)+i);
			obj[tmpList.length] = {};
			for(var j in arguments[m][i]){
				obj[tmpList.length][j] = arguments[m][i][j];
			}
		    obj[tmpList.length]['id'] = new_id;
		    obj[tmpList.length]['father'] = $.DataMap[arguments[m][i]['father'].toLowerCase()+'_ssid']; // maybe need decodeURIComponent().
			if(more){obj2obj(tmpList,obj)};
		}
		obj2obj(tmpList,obj);
	}
	for(var n in list_a){tmpList[n]['father'] = $.DataMap.ssid;}  //  修改主AP的SSID.
	return tmpList;
}
function apscanChannel(ssid){
	getRequestData("netcore_get",{"ap_scan":"1","wlan_idx_num":"0"},function(data){
		var list = $.DataMap.ap_scan_list;
		for(var i in list){
			if(list[i].wl_ss_ssid==ssid)
				APCHAN = list[i].wl_ss_channel.split(' ')[0];
		}
	});
	return APCHAN;
}
function set_vlan_tag(parame,obj){
	switch(parame.conntype){
			case '5'://unifi
				obj.tag_type=1;
				break;
			case '8'://maxis
				obj.tag_type=2;
				break;
			default:
				obj.tag_type=0;
				break;
		}
}
function set_bridge_logic(){
	if($.DataMap.access_mode=='1'){ //Bridge
		ID("p_menu_qos").style.display="none";
		ID("p_menu_forward").style.display="none";
		ID("p_menu_management").style.display="none";
		ID("p_menu_ddns").style.display="none";
		ID("p_menu_advanced").style.display="none";
	
		ID("c_menu_wan").style.display="none";
		ID("c_menu_iptv").style.display="none";
		ID("c_menu_remote").style.display="none";
		if($.CurrentApp=="status"){getPan(2).hide();}
	}else{
		ID("p_menu_qos").style.display="block";
		ID("p_menu_forward").style.display="block";
		ID("p_menu_management").style.display="block";
		ID("p_menu_ddns").style.display="block";
		ID("p_menu_advanced").style.display="block";
	
		ID("c_menu_wan").style.display="block";
		ID("c_menu_iptv").style.display="block";
		ID("c_menu_remote").style.display="block";
		if($.CurrentApp=="status"){getPan(2).show();}
	}
}
function is_ip(data){
	var reg_ip = new RegExp(/^((22[0-3])|(2[0-1]\d)|(1\d\d)|([1-9]\d)|[1-9])(\.((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d)){3}$/);
	var is_ip = reg_ip.test(data);
	return is_ip;
}
function set_wan_ap_scan_logic(parame,obj){
	if(APCHAN!=0){ // Just for ap scan.
		if(APSEC=='WEP'){
			if(parame.rp_key_wep.length=='5'){
				obj.rp_key_size = '0';
				obj.rp_key_mode_wep = '1';			
			}else if(parame.rp_key_wep.length=='10'){
				obj.rp_key_size = '0';
				obj.rp_key_mode_wep = '0';
			}else if(parame.rp_key_wep.length=='13'){
				obj.rp_key_size = '1';
				obj.rp_key_mode_wep = '1';
			}else if(parame.rp_key_wep.length=='26'){
				obj.rp_key_size = '1';
				obj.rp_key_mode_wep = '0';
			}
		}else if(APSEC=='WPA'||APSEC=='WPA-PSK'||APSEC=='WPA2'||APSEC=='WPA2-PSK'||APSEC=='WPA/WPA2'||APSEC=='WPA-PSK/WPA2'||APSEC=='WPA-PSK/WPA2-PSK'){
			obj.rp_key_mode_wpa =(parame.rp_key_wpa.length==64)?'0':'1';
		}
	}
}
