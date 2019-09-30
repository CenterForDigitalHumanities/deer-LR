package auth;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/**
 *
 * @author bhaberbe
 */
public class Authorize {

    private String info = "sec.txt";
    private String info_loc = "";
    private JSONArray admins_list;
    private JSONObject userData;

    public final void init() throws FileNotFoundException, IOException{
        /*
            Your properties file must be in the deployed .war file in WEB-INF/classes/tokens.  It is there automatically
            if you have it in Source Packages/java/tokens when you build.  That is how this will read it in without defining a root location
            https://stackoverflow.com/questions/2395737/java-relative-path-of-a-file-in-a-java-web-application
        */
        info = Authorize.class.getResource(info).toString();
        String users = new String(Files.readAllBytes(Paths.get(info))); 
        userData = JSONObject.fromObject(users);
        admins_list = userData.getJSONArray("admins");
    }

    public void setInfoFileLoc(String location){
        info_loc = location;
    }

    public String getInfoFileLoc(){
        return info_loc;
    }
    
    public JSONArray getAdmins(){
        return admins_list;
    }

    public boolean isAdmin(String user){
        return userData.getJSONObject(user).getJSONObject("roles").getBoolean("administrator");
    }

    public boolean isAuthorized(String user, String pwd){
        return userData.getJSONObject(user).getString("password").equals(pwd);
    }
    
    public JSONObject getUserObject(String user){
        return userData.getJSONObject(user);
    }
    
    public String getUserID(String user){
        return userData.getJSONObject(user).getString("@id");
    }
    
    public JSONArray getUserRoles(String user){
        return userData.getJSONObject(user).getJSONArray("roles");
    }
    
}