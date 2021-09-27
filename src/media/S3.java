/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package media;
import java.io.FileNotFoundException;
import java.io.IOException;
import tokens.TinyTokenManager;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Random;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.transfer.s3.S3ClientConfiguration;
import software.amazon.awssdk.transfer.s3.S3TransferManager;
import software.amazon.awssdk.transfer.s3.CompletedDownload;
import software.amazon.awssdk.transfer.s3.CompletedUpload;
import software.amazon.awssdk.transfer.s3.Download;
import software.amazon.awssdk.transfer.s3.Upload;
import software.amazon.awssdk.transfer.s3.UploadRequest;

import java.io.File;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;


/**
 *
 * @author bhaberbe
 */
public class S3 {
    
    private String s3_access_id = "";
    private String s3_secret = "";
    /**
     * Initializer for a TinyTokenManager that reads in the properties File
     * @throws IOException if no properties file
     */
    public S3() throws IOException {
        init();
    }
    
    private void init() throws FileNotFoundException, IOException{
        /*
            Your properties file must be in the deployed .war file in WEB-INF/classes/tokens.  It is there automatically
            if you have it in Source Packages/java/tokens when you build.  That is how this will read it in without defining a root location
            https://stackoverflow.com/questions/2395737/java-relative-path-of-a-file-in-a-java-web-application
        */
        TinyTokenManager manager = new TinyTokenManager();
        s3_access_id = manager.getS3AccessID();
        s3_secret = manager.getS3Secret();
        
    }
    
    private void uploadFile(){
        S3TransferManager transferManager = S3TransferManager.create();
        String bucket = "a";
        String key = "b";
        Upload upload = transferManager.upload(b -> b.putObjectRequest(r -> r.bucket(bucket).key(key)).source(Paths.get("fileToUpload.txt")));
        CompletedUpload completedUpload = upload.completionFuture().join();

        System.out.println("PutObjectResponse: " + completedUpload.response());
    }
    
    private void listAvailableFiles(){
        
    }
    
    
    
    
}
