/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package servlets;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
        
        /*
        let secrets = await fetch('src/tokens/sec.txt')
        .then(response => response.text())
        secrets = JSON.parse(secrets)
        let admins = await fetch('src/tokens/admins.txt')
          .then(response => response.text()) 
        admins = admins.split(",")
        let usrSecret = document.getElementById("login-pwd").value //Get the user input
        //If user is an admin, set the admin flag for the session. 
        //login success should redirect to new_schema.html after storing the user information. These people/classes should have an Agent ID from RERUM to do this as properly as possible.  
        if(admins.includes(who)){
            if (usrSecret == secrets.admin){
                LR.ui.loginRedirect(who)   
            }
            else{
                LR.ui.loginFail()
            }
        }
        else{
            //Ask for the class password
            switch(who){
                case "LR_2017":
                    if (usrSecret == secrets.LR_2017){
                        LR.ui.loginRedirect(who)
                    }
                    else{
                        LR.ui.loginFail()
                    }
                break;
                case "LR_2018":
                    if (usrSecret == secrets.LR_2018){
                        LR.ui.loginRedirect(who)
                    }
                    else{
                        LR.ui.loginFail()
                    }
                break;
                case "LR_2019":
                    if (usrSecret == secrets.LR_2019){
                        LR.ui.loginRedirect(who)
                    }
                    else{
                        LR.ui.loginFail()
                    }
                break;
                default:
                    alert("There is no user registered for "+who+".  Please contact the administrator for more information.")
            }
        }
        */
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
