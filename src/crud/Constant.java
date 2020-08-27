/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package crud;

/**
 *
 * @author bhaberbe
 */
public class Constant {
    /**
     * prd-01
     */
  
    public static String RERUM_REGISTRATION_URL = "http://store.rerum.io/v1/";
    public static String RERUM_API_ADDR = "http://store.rerum.io/v1/api";
    public static String RERUM_ACCESS_TOKEN_URL = "http://store.rerum.io/v1/api/accessToken.action";
    public static String RERUM_REFRESH_TOKEN_URL = "http://store.rerum.io/v1/api/refreshToken.action";
    public static String RERUM_AGENT = "http://store.rerum.io/v1/id/5da8c165d5de6ba6e2028474"; //Lived-Religion-prod
  
    
    /**
     * dev-01
     */
    /*
    public static String RERUM_REGISTRATION_URL = "http://devstore.rerum.io/v1/";
    public static String RERUM_API_ADDR = "http://devstore.rerum.io/v1/api";
    public static String RERUM_ACCESS_TOKEN_URL = "http://devstore.rerum.io/v1/api/accessToken.action";
    public static String RERUM_REFRESH_TOKEN_URL = "http://devstore.rerum.io/v1/api/refreshToken.action";
    public static String RERUM_AGENT = "http://devstore.rerum.io/v1/id/5afeebf3e4b0b0d588705d90"; //This is sandbox-dev
    */
    
    //https://stackoverflow.com/questions/2395737/java-relative-path-of-a-file-in-a-java-web-application
    public static String PROPERTIES_FILE_NAME = "lr.properties";
}
