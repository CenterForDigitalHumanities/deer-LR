/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package servlets;

import auth.Authorize;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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
        response.setStatus(HttpServletResponse.SC_CREATED);
        response.addHeader("Content-Type", "application/json; charset=utf-8");
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
           jo_return.element("user", user);
           jo_return.element("@id", authorizer.getUserID(user));
           jo_return.element("roles", authorizer.getUserRoles(user));
        }
        else{
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            jo_return.element("error", "Unauthorized");
        }
        response.addHeader("Content-Type", "application/json; charset=utf-8");
        response.setContentType("UTF-8");
        PrintWriter out = response.getWriter();
        Gson bldr = new GsonBuilder().setPrettyPrinting().create();
        out.write(bldr.toJson(jo_return));
        
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
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
        return "Lived Religion application login servlet.";
    }// </editor-fold>

}
