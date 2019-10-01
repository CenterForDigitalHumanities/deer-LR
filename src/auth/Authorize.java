package auth;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/**
 * For interaction with the Users file.
 * The user file is a JSON object containing users with roles and passwords.
 * @author bhaberbe
 */
public class Authorize {

    private String users_file = "users.txt";
    private JSONArray admins_list;
    private JSONObject userData;

    public final void init() throws FileNotFoundException, IOException{
        users_file = Authorize.class.getResource(users_file).toString();
        users_file = users_file.replace("file:/", "");
        users_file = users_file.replace("file:", "");
        String users = new String(Files.readAllBytes(Paths.get(users_file))); 
        userData = JSONObject.fromObject(users);
        admins_list = userData.getJSONArray("admin_list");
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