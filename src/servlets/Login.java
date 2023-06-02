/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package servlets;

import auth.Authorize;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import net.sf.json.JSONObject;

/**
 *
 * @author bhaberbe
 */
public class Login extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setHeader("Access-Control-Allow-Origin", "*"); //To use this as an API, it must contain CORS headers
        response.setHeader("Access-Control-Expose-Headers", "*"); //Headresponse.setHeader("Access-Control-Allow-Methods", "DELETE");ers are restricted, unless you explicitly expose them.  Darn Browsers.
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST");
            
        String requestBody;
        ServletInputStream input = request.getInputStream();
        InputStreamReader reader = new InputStreamReader(input, "utf-8");
        BufferedReader bodyReader = new BufferedReader(reader);
        StringBuilder bodyString = new StringBuilder();
        String line;
        JSONObject jo_return = new JSONObject();
        while ((line = bodyReader.readLine()) != null)
        {
          bodyString.append(line);
        }
        requestBody = bodyString.toString();
        JSONObject jo_request = JSONObject.fromObject(requestBody);
        String user = jo_request.getString("username");
        String pwd = jo_request.getString("password");
        Authorize authorizer = new Authorize();
        if(authorizer.isAuthorized(user, pwd)){
           //Check if the password for that user matches 
           response.setStatus(HttpServletResponse.SC_OK);
           HttpSession sess = request.getSession(true);
           jo_return.element("name", user);
           jo_return.element("@id", authorizer.getUserID(user));
           jo_return.element("roles", authorizer.getUserRoles(user));
           sess.setAttribute("lr-user", jo_return);
        }
        else{
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            jo_return.element("error", "Unauthorized");
        }
        response.getWriter().print(jo_return);
        
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
     * Handles the HTTP <code>OPTIONS</code> preflight method.
     * This should be a configurable option.  Turning this on means you
     * intend for this version of Tiny Things to work like an open API.  
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Headers", "*");
            response.setHeader("Access-Control-Allow-Methods", "*");
            response.setHeader("Access-Control-Expose-Headers", "*"); //Headers are restricted, unless you explicitly expose them.  Darn Browsers.
            response.setStatus(200);
            
        } catch (Exception ex) {
            System.out.println("ex");
            response.sendError(500, ex.getMessage());
        }
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Lived Religion application login servlet.";
    }// </editor-fold>

}
