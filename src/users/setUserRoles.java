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
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/**
 *
 * @author bhaberbe
 */
@WebServlet(name = "setUserRoles", urlPatterns = {"/setUserRoles"})
public class setUserRoles extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
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
        System.out.println("User file before edit");
        System.out.println(usersFile);
        usersFile.getJSONObject(username).remove("roles");
        usersFile.getJSONObject(username).accumulate("roles", roles);
        System.out.println("User file after edit");
        System.out.println(usersFile);
        auth.writeUserFile(usersFile);
        response.getWriter().print("User Roles Updated");
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
        return "Short description";
    }// </editor-fold>

}
