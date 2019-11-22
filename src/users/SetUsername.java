/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package users;

import auth.Authorize;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;
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
public class SetUsername extends HttpServlet {

    /**
     * Change the username of a user in the user file.  JSON is provided in the body that includes
     * username The username to change
     * newname  What the new username should be
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setCharacterEncoding("UTF-8");
        HttpSession sess = request.getSession();
        if(sess.getAttribute("lr-user") != null){
            JSONObject session_user = JSONObject.fromObject(sess.getAttribute("lr-user"));
            if(session_user.getJSONObject("roles").getBoolean("administrator")){
                BufferedReader bodyReader = request.getReader();
                StringBuilder bodyString = new StringBuilder();
                String line;
                JSONObject requestJSON;
                while ((line = bodyReader.readLine()) != null)
                {
                  bodyString.append(line);
                }
                requestJSON = JSONObject.fromObject(bodyString.toString());
                String origUsername = requestJSON.getString("username");
                String newUsername = requestJSON.getString("newname");
                Authorize auth = new Authorize();
                JSONObject usersFile = auth.getUserData();
                JSONObject origUserObj = usersFile.getJSONObject(origUsername);
                usersFile.remove(origUsername);
                usersFile.accumulate(newUsername, origUserObj);
                auth.writeUserFile(usersFile);
                response.getWriter().print("The username '"+origUsername+"' has been updated to "+newUsername+".");
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
        return "Short description";
    }

}
