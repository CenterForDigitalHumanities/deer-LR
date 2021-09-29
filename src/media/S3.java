/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package media;
import java.io.FileNotFoundException;
import tokens.TinyTokenManager;
import java.io.IOException;
import software.amazon.awssdk.transfer.s3.S3TransferManager;
import software.amazon.awssdk.transfer.s3.CompletedDownload;
import software.amazon.awssdk.transfer.s3.CompletedUpload;
import software.amazon.awssdk.transfer.s3.Download;
import software.amazon.awssdk.transfer.s3.Upload;
import software.amazon.awssdk.transfer.s3.UploadRequest;

import java.nio.file.Paths;
import java.util.ArrayList;


import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;
import java.util.List;
import java.util.ListIterator;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.transfer.s3.S3ClientConfiguration;


/**
 *
 * @author bhaberbe
 */
public class S3 {
    
    private String s3_access_id = "";
    private String s3_secret = "";
    private String bucket_name = "";
    private Region region;
    private S3TransferManager transferManager;
    private S3Client s3;
    /**
     * Initializer for a TinyTokenManager that reads in the properties File
     * @throws IOException if no properties file
     */
    public S3() throws IOException {
        System.out.println("initializing S3...");
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
        bucket_name = manager.getS3BucketName();
        region = manager.getS3Region();
        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(s3_access_id,s3_secret);
        
        System.out.println("Build S3 Transfer Manager...");
        //How the TransferManager docs said to build this out for it when we have to provide the connection info
        S3ClientConfiguration s3Config =
            S3ClientConfiguration.builder()
                .region(Region.US_WEST_1)
                .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
            .build();
        transferManager = S3TransferManager.builder().s3ClientConfiguration(s3Config).build(); 
        
        System.out.println("Build S3 Client...");
        //How the General AWS docs said to make the client.
        s3 = S3Client.builder()
            .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
            .region(Region.US_WEST_1)
            .build();
        
        
        
    }
    
    public CompletedDownload downloadFile(String filename, String saveAs){
        Download download = transferManager.download(b -> b.getObjectRequest(r -> r.bucket(bucket_name).key(filename)).destination(Paths.get(saveAs)));
        CompletedDownload completedDownload = download.completionFuture().join();
        return completedDownload;
    }
    
    public CompletedUpload uploadFile(String filename, String saveAs){
        Upload upload = transferManager.upload(b -> b.putObjectRequest(r -> r.bucket(bucket_name).key(saveAs)).source(Paths.get(saveAs)));
        CompletedUpload completedUpload = upload.completionFuture().join();
        return completedUpload;
    }
    
    public ArrayList<String> listBucketFiles(){
        
       ArrayList<String> filenames = new ArrayList<>();
       try {
            ListObjectsRequest listObjects = ListObjectsRequest
                    .builder()
                    .bucket(bucket_name)
                    .build();
            ListObjectsResponse res = s3.listObjects(listObjects);
            List<S3Object> objects = res.contents();
            for (ListIterator iterVals = objects.listIterator(); iterVals.hasNext(); ) {
                S3Object myValue = (S3Object) iterVals.next();
                filenames.add(myValue.key() +"  "+calKb(myValue.size()) + " KBs");
            }
        } 
        catch (S3Exception e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            filenames.clear();
        }
        return filenames;
    }
    
    //convert bytes to kbs
    private static long calKb(Long val) {
        return val/1024;
    }

}
