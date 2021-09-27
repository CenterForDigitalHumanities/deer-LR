/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package servlets;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import media.S3;
import net.sf.json.JSONObject;
import software.amazon.awssdk.transfer.s3.CompletedUpload;

/**
 *
 * @author bhaberbe
 */
public class UploadFileToS3Bucket extends HttpServlet {

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
        S3 bucket = new S3();
        CompletedUpload up = bucket.uploadFile("","");
        /*
        BufferedReader bodyReader = request.getReader();
        StringBuilder bodyString = new StringBuilder();
        JSONObject requestJSON = new JSONObject();
        String requestString;
        String line;
        boolean moveOn = false;
        while ((line = bodyReader.readLine()) != null)
        {
          bodyString.append(line);
        }
        requestString = bodyString.toString();
        try{ 
            //JSONObject test
            requestJSON = JSONObject.fromObject(requestString);
            moveOn = true;
        }
        catch(Exception ex){
            response.setStatus(500);
            response.getWriter().print(ex);
        }    
        */
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.getWriter().print(up.response());
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
        return "Connect to AWS S3 bucket and put a file in there.";
    }// </editor-fold>

}
