/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package crud;

import auth.Authorize;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import tokens.TinyTokenManager;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpSession;
import net.sf.json.JSONObject;

/**
 *
 * @author bhaberbe
 */
public class TinyDelete extends HttpServlet {    
    
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
            throws ServletException, IOException, Exception {
        request.setCharacterEncoding("UTF-8");
        System.out.println("LR Dev Delete");
        TinyTokenManager manager = new TinyTokenManager();
        BufferedReader bodyReader = request.getReader();
        StringBuilder bodyString = new StringBuilder();
        String line;
        String requestString;
        StringBuilder sb = new StringBuilder();
        int codeOverwrite = 500;
        boolean moveOn = false;
        while ((line = bodyReader.readLine()) != null)
        {
          bodyString.append(line);
        }
        requestString = bodyString.toString();
        System.out.println("Body??");
        System.out.println(requestString);
        String pubTok = manager.getAccessToken();
        boolean expired = manager.checkTokenExpiry();
        if(expired){
            System.out.println("Lived Religion detected an expired token, auto getting and setting a new one...");
            pubTok = manager.generateNewAccessToken();
        }
        
        /**
         * Check that the session knows the user.
         * Check if the known user is an administrator, only they can delete for the time being.
         */
        HttpSession sess = request.getSession();
        if(sess.getAttribute("lr-user") != null){
            JSONObject session_user = JSONObject.fromObject(sess.getAttribute("lr-user"));
            if(session_user.getJSONObject("roles").getBoolean("administrator")){
                moveOn = true;
            }
            else{
                sb.append("You must be a Lived Religion administrator to delete items at this time.");
                codeOverwrite = HttpServletResponse.SC_UNAUTHORIZED;
            }
        }
        else{
            sb.append("Please login again.");
            codeOverwrite = HttpServletResponse.SC_FORBIDDEN;
        }
        
        if(moveOn){
            //Point to rerum server v1
            System.out.println("Moving on to delete.action...");
            
            URL postUrl = new URL(Constant.RERUM_API_ADDR + "/delete.action");
            HttpURLConnection connection = (HttpURLConnection) postUrl.openConnection();
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setRequestMethod("DELETE");
            connection.setUseCaches(false);
            connection.setInstanceFollowRedirects(true);
            connection.setRequestProperty("Authorization", "Bearer "+pubTok);
            System.out.println("connect to delete.action...");
            connection.connect();
            try{
                DataOutputStream out = new DataOutputStream(connection.getOutputStream());
                //Pass in the user provided JSON for the body of the rerumserver v1 request
                byte[] toWrite = requestString.getBytes("UTF-8");
                //out.writeBytes(requestJSON.toString());
                System.out.println("Add request body to delete.action");
                out.write(toWrite);
                out.flush();
                out.close(); 
                codeOverwrite = connection.getResponseCode();
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(),"utf-8"));
                System.out.println("RERUM CODE");
                System.out.println(codeOverwrite);
                while ((line = reader.readLine()) != null){
                    //Gather rerum server v1 response
                    sb.append(line);
                }
                reader.close();
                for (Map.Entry<String, List<String>> entries : connection.getHeaderFields().entrySet()) {
                    String values = "";
                    String removeBraks = entries.getValue().toString();
                    values = removeBraks.substring(1, removeBraks.length() -1);
                    if(null != entries.getKey() && !entries.getKey().equals("Transfer-Encoding")){
                        response.setHeader(entries.getKey(), values);
                    }
                }
            }
            catch(IOException ex){
                //Need to get the response RERUM sent back.
                BufferedReader error = new BufferedReader(new InputStreamReader(connection.getErrorStream(),"utf-8"));
                String errorLine = "";
                while ((errorLine = error.readLine()) != null){  
                    sb.append(errorLine);
                } 
                System.out.println("ERROR DELETEING");
                System.out.println(sb.toString());
                error.close();
            }
            connection.disconnect();
        }
        if(manager.getAPISetting().equals("true")){
            response.addHeader("Access-Control-Allow-Origin", "*"); //To use this as an API, it must contain CORS headers
            response.setHeader("Access-Control-Expose-Headers", "*"); //Headresponse.setHeader("Access-Control-Allow-Methods", "DELETE");ers are restricted, unless you explicitly expose them.  Darn Browsers.
            response.setHeader("Access-Control-Allow-Headers", "*");
            response.setHeader("Access-Control-Allow-Methods", "DELETE");
        }
        
        response.setStatus(codeOverwrite);
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().print(sb.toString());
    }

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
        try {
            processRequest(request, response);
        } catch (Exception ex) {
            Logger.getLogger(TinyDelete.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    /**
     * Handles the HTTP <code>DELETE</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            System.out.println("doDelete()");
            processRequest(request, response);
        } catch (Exception ex) {
            Logger.getLogger(TinyDelete.class.getName()).log(Level.SEVERE, null, ex);
        }
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
            TinyTokenManager manager = new TinyTokenManager();
            String openAPI = manager.getAPISetting();
            if(openAPI.equals("true")){
                //These headers must be present to pass browser preflight for CORS
                response.addHeader("Access-Control-Allow-Origin", "*");
                response.addHeader("Access-Control-Allow-Headers", "*");
                response.addHeader("Access-Control-Allow-Methods", "*");
                response.setHeader("Access-Control-Expose-Headers", "*"); //Headers are restricted, unless you explicitly expose them.  Darn Browsers.
            }
            response.setStatus(200);
            
        } catch (Exception ex) {
            Logger.getLogger(TinyQuery.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Mark an object at a known `id` as deleted, removing it from the version history.";
    }// </editor-fold>

}
