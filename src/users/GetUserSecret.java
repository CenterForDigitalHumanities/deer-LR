/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package users;

import auth.Authorize;
import java.io.BufferedReader;
import java.io.IOException;
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
public class GetUserSecret extends HttpServlet {

    /**
     * Get the passsword of a user.  The username is provided in the body as a String.
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
                String username;
                while ((line = bodyReader.readLine()) != null)
                {
                  bodyString.append(line);
                }
                username = bodyString.toString(); //This is the name of the user
                Authorize auth = new Authorize();
                JSONObject usersFile = auth.getUserData();
                String sec = usersFile.getJSONObject(username).getString("sec");
                response.getWriter().print(sec);
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
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        //processRequest(request, response);
        response.getWriter().print("This endpoint is currently shut off.");
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Get the password for a provided user from the Lived Religion users file.";
    }

}
