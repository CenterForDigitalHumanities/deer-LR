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

// Import Firebase dependencies
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

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
     * @throws Exception if a token validation error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException, Exception {
        request.setCharacterEncoding("UTF-8");
        TinyTokenManager manager = new TinyTokenManager();
        BufferedReader bodyReader = request.getReader();
        StringBuilder bodyString = new StringBuilder();
        String line;
        String requestString;
        StringBuilder sb = new StringBuilder();
        int codeOverwrite = 500;
        boolean moveOn = false;

        // Read the body of the request
        while ((line = bodyReader.readLine()) != null) {
            bodyString.append(line);
        }
        requestString = bodyString.toString();

        // Check if a Bearer token is present in the Authorization header
        String authHeader = request.getHeader("Authorization");
        boolean isBearerToken = false;
        boolean isAdmin = false; // To track if the user is an admin

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String bearerToken = authHeader.substring(7); // Extract the token after "Bearer "
            isBearerToken = validateBearerToken(bearerToken);
            if (isBearerToken) {
                isAdmin = checkAdminRoleFromToken(bearerToken); // Check if the Bearer token grants admin rights
                moveOn = true; // If the Bearer token is valid, proceed
            }
        }

        // If no Bearer token or invalid, proceed with session-based checks
        if (!isBearerToken) {
            HttpSession sess = request.getSession();
            if (sess.getAttribute("lr-user") != null) {
                JSONObject session_user = JSONObject.fromObject(sess.getAttribute("lr-user"));
                if (session_user.getJSONObject("roles").getBoolean("administrator")) {
                    isAdmin = true;
                    moveOn = true;
                } else {
                    sb.append("You must be an administrator to delete items.");
                    codeOverwrite = HttpServletResponse.SC_UNAUTHORIZED;
                }
            } else {
                sb.append("Please login again.");
                codeOverwrite = HttpServletResponse.SC_FORBIDDEN;
            }
        }

        // Proceed if authorized
        if (moveOn && (isAdmin || isBearerToken)) { // Ensure either the user is an admin or the token is valid
            URL postUrl = new URL(Constant.RERUM_API_ADDR + "/delete.action");
            HttpURLConnection connection = (HttpURLConnection) postUrl.openConnection();
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setRequestMethod("DELETE");
            connection.setUseCaches(false);
            connection.setInstanceFollowRedirects(true);
            if (isBearerToken) {
                connection.setRequestProperty("Authorization", authHeader); // Pass the Bearer token forward
            } else {
                connection.setRequestProperty("Authorization", "Bearer " + manager.getAccessToken());
            }
            connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
            connection.connect();
            try {
                DataOutputStream out = new DataOutputStream(connection.getOutputStream());
                byte[] toWrite = requestString.getBytes("UTF-8");
                out.write(toWrite);
                out.flush();
                out.close();
                codeOverwrite = connection.getResponseCode();
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), "utf-8"));
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                reader.close();
                for (Map.Entry<String, List<String>> entries : connection.getHeaderFields().entrySet()) {
                    String values = "";
                    String removeBraks = entries.getValue().toString();
                    values = removeBraks.substring(1, removeBraks.length() - 1);
                    if (null != entries.getKey() && !entries.getKey().equals("Transfer-Encoding")) {
                        response.setHeader(entries.getKey(), values);
                    }
                }
            } catch (IOException ex) {
                BufferedReader error = new BufferedReader(new InputStreamReader(connection.getErrorStream(), "utf-8"));
                String errorLine = "";
                while ((errorLine = error.readLine()) != null) {
                    sb.append(errorLine);
                }
                error.close();
            }
            connection.disconnect();
        }

        if (manager.getAPISetting().equals("true")) {
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Expose-Headers", "*");
            response.setHeader("Access-Control-Allow-Headers", "*");
            response.setHeader("Access-Control-Allow-Methods", "DELETE");
        }

        response.setStatus(codeOverwrite);
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().print(sb.toString());
    }

    /**
     * Helper method to validate the Bearer token.
     * 
     * @param token the Bearer token to validate
     * @return true if the token is valid, false otherwise
     */
    private boolean validateBearerToken(String token) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            // Token is valid
            return true;
        } catch (Exception e) {
            // Invalid token
            return false;
        }
    }

    /**
     * Helper method to check if the user has admin role based on the Bearer token.
     * 
     * @param token the Bearer token
     * @return true if the user has admin role, false otherwise
     */
    private boolean checkAdminRoleFromToken(String token) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            Map<String, Object> claims = decodedToken.getClaims();
            // Assume the admin role is encoded in the claims with a key like "admin"
            return claims.containsKey("admin") && (Boolean) claims.get("admin");
        } catch (Exception e) {
            return false;
        }
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
            if (openAPI.equals("true")) {
                // These headers must be present to pass browser preflight for CORS
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.setHeader("Access-Control-Allow-Headers", "*");
                response.setHeader("Access-Control-Allow-Methods", "*");
                response.setHeader("Access-Control-Expose-Headers", "*"); // Headers are restricted, unless you explicitly expose them.  Darn Browsers.
            }
            response.setStatus(200);

        } catch (Exception ex) {
            Logger.getLogger(TinyDelete.class.getName()).log(Level.SEVERE, null, ex);
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
