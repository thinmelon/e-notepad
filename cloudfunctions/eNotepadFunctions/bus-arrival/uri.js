exports.main = {
    /** 获取城市列表 
     * 	名称	必填	类型	说明
     * optype	是	string	固定值：city
     * uname	是	string	笑园API账号（用户名）
    */
    BUS_ARRIVAL_SUPPORT_CITY_LIST: "http://api.dwmm136.cn/z_busapi/BusApi.php?optype=city&uname=%s",
    /** 搜索公交路线
     * 	名称	必填	类型	说明
     * 	optype	是	string	固定值：luxian
     * 	uname	是	string	笑园API账号（用户名）
     * 	cityid	是	int	城市ID（城市API获得）
     * 	keywords	是	string	公交搜索 如：3（搜索3路公交）
     * 	keySecret	是	string	签名 MD5(uname+key+optype)
     */
    BUS_ARRIVAL_ROUTER_LIST: "http://api.dwmm136.cn/z_busapi/BusApi.php?optype=luxian&uname=%s&cityid=%s&keywords=%s&keySecret=%s",
    /** 公交实时位置
     * 名称	必填	类型	说明
     * optype	是	string	固定值：rtbus
     * uname	是	string	笑园API账号（用户名）
     * cityid	是	int	城市ID（城市API获得）
     * bus_linestrid	是	string	路线ID（路线API获得）
     * bus_linenum	是	string	路线编号（路线API获得）
     * bus_staname	是	string	路线名称（路线API获得）
     * keySecret	是	string	签名 MD5(uname+key+optype)
     */
    BUS_ARRIVAL_REAL_TIME_POSITION: "http://api.dwmm136.cn/z_busapi/BusApi.php?optype=rtbus&uname=%s&cityid=%s&bus_linestrid=%s&bus_linenum=%s&bus_staname=%s&keySecret=%s",
}