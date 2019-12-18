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
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/**
 *
 * @author bhaberbe
 */
@WebServlet(name = "setUserRoles", urlPatterns = {"/setUserRoles"})
public class SetUserRoles extends HttpServlet {

    /**
     * Update the roles for a user.  JSON is provided in the body that includes
     * username The user to update the roles for
     * roles The new roles JSON to apply to the user
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
                String username = requestJSON.getString("username");
                JSONObject roles = requestJSON.getJSONObject("roles");
                Authorize auth = new Authorize();
                JSONObject usersFile = auth.getUserData();
                usersFile.getJSONObject(username).remove("roles");
                usersFile.getJSONObject(username).accumulate("roles", roles);
                auth.writeUserFile(usersFile);
                response.getWriter().print("User roles have been updated.");
            }
            else{
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            }
        }
        else{
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        }   
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Set new user roles for a Lived Religion user in the user file.";
    }

}
