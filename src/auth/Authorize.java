package auth;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
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
        info = Authorize.class.getResource(info).toString();
        info = info.replace("file:/", "");
        info = info.replace("file:", "");
        String users = new String(Files.readAllBytes(Paths.get(info))); 
        userData = JSONObject.fromObject(users);
        admins_list = userData.getJSONArray("admin_list");
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
        Boolean pass = false;
        if(userData.has(user)){
            pass = userData.getJSONObject(user).getString("sec").equals(pwd);
        }
        return pass;
    }
    
    public JSONObject getUserObject(String user){
        return userData.getJSONObject(user);
    }
    
    public String getUserID(String user){
        return userData.getJSONObject(user).getString("@id");
    }
    
    public JSONObject getUserRoles(String user){
        return userData.getJSONObject(user).getJSONObject("roles");
    }
    
}