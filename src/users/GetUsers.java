/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package users;

import auth.Authorize;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.sf.json.JSONObject;

/**
 *
 * @author bhaberbe
 */
public class GetUsers extends HttpServlet {

    /**
     * Get the entire user file and send it back in the response.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setCharacterEncoding("UTF-8");
        StringBuilder sb = new StringBuilder();
        Authorize auth = new Authorize();
        JSONObject usersFile = auth.getUserData();
        response.getWriter().print(usersFile);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    public String getServletInfo() {
        return "Get the JSON representation of the User file for Lived Religion.";
    }

}
