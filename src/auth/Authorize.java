package auth;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
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

    private String users_file = "users.json";
    private JSONObject userData;
    
    public Authorize() throws IOException, FileNotFoundException {
        File file = new File(Authorize.class.getResource(users_file).getFile());
        users_file = file.getAbsolutePath();
        String users = new String(Files.readAllBytes(Paths.get(users_file))); 
        userData = JSONObject.fromObject(users);
    }

    public JSONArray getAdmins(){
        //TODO need to logic to create an array of usernames that have administrator roles.
        return new JSONArray();
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
    
    public JSONObject getUserData(){
        return userData;
    }
    
    public void writeUserFile(JSONObject userJSON) throws IOException {
        FileWriter writer = new FileWriter(users_file, false);
        BufferedWriter bufferedWriter = new BufferedWriter(writer);
        bufferedWriter.write(userJSON.toString());
        bufferedWriter.close();
        userData = userJSON;
    }
    
}