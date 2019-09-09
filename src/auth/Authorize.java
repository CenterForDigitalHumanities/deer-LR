package auth;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

/**
 *
 * @author bhaberbe
 */
public class Authorize {

    private String secrets = "sec.properties";
    private String admins = "admins.properties";
    private Properties sec_props = new Properties();
    private Properties admins_props = new Properties();
    private String sec_fileLoc = "";
    private String admins_fileLoc = "";
    private String[] admins_list;

    public final void init() throws FileNotFoundException, IOException{
        /*
            Your properties file must be in the deployed .war file in WEB-INF/classes/tokens.  It is there automatically
            if you have it in Source Packages/java/tokens when you build.  That is how this will read it in without defining a root location
            https://stackoverflow.com/questions/2395737/java-relative-path-of-a-file-in-a-java-web-application
        */
        sec_fileLoc =Authorize.class.getResource(secrets).toString();
        admins_fileLoc =Authorize.class.getResource(admins).toString();
        sec_fileLoc = sec_fileLoc.replace("file:", "");
        admins_fileLoc = admins_fileLoc.replace("file:", "");
        InputStream input_sec = new FileInputStream(sec_fileLoc);
        InputStream input_admins = new FileInputStream(admins_fileLoc);
        sec_props.load(input_sec);
        admins_props.load(input_admins);
        admins_list = admins_props.getProperty("admins_list").split(",");
    }

    public void setSecFileLoc(String location){
        sec_fileLoc = location;
    }

    public String getSecFileLoc(){
        return sec_fileLoc;
    }

    public void setAdminsFileLoc(String location){
        admins_fileLoc = location;
    }

    public String getAdminsFileLoc(){
        return admins_fileLoc;
    }

    public void setSecProps(Properties props){
        sec_props = props;
    }

    public Properties getSecProps(){
        return sec_props;
    }

    public void setAdminsProps(Properties props){
        admins_props = props;
    }

    public Properties getAdminsProps(){
        return admins_props;
    }

    public boolean isAdmin(String user){
        List<String> list = Arrays.asList(admins_list);
        return list.contains(user);
    }

    public boolean isAuthorized(String user, String pwd){
        return pwd.equals(sec_props.getProperty(user));
    }


}