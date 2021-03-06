/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package users;

import auth.Authorize;
import java.io.BufferedReader;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import net.sf.json.JSONObject;

/**
 *
 * @author bhaberbe
 */
public class AddUser extends HttpServlet {

    /**
     * Add a user to the users file.  JSON is provided in the body containing
     * username the key to add to the users file
     * userbody the information for that key
     * 
     * Remo
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        HttpSession sess = request.getSession();
        if(sess.getAttribute("lr-user") != null){
            JSONObject session_user = JSONObject.fromObject(sess.getAttribute("lr-user"));
            if(session_user.getJSONObject("roles").getBoolean("administrator")){
                BufferedReader bodyReader = request.getReader();
                StringBuilder bodyString = new StringBuilder();
                String line;
                String user_obj_str;
                JSONObject requestJSON;
                while ((line = bodyReader.readLine()) != null)
                {
                  bodyString.append(line);
                }
                user_obj_str = bodyString.toString();
                requestJSON = JSONObject.fromObject(user_obj_str);
                Authorize auth = new Authorize();
                JSONObject usersFile = auth.getUserData();
                usersFile.element(requestJSON.getString("username"), requestJSON.getJSONObject("userbody"));
                auth.writeUserFile(usersFile);
                response.getWriter().print("User '"+requestJSON.getString("username")+"' added to users file.");
            }
            else{
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            }
        }
        else{
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        }
        
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    public String getServletInfo() {
        return "Put an additional user in the Lived Religion users file.";
    }

}
