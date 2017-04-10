// An HTTP trigger Azure Function that returns a SAS token for Azure Storage for the specified container. 
// You can also optionally specify a particular blob name and access permissions. 
// from https://github.com/PiDiBi/functions-node-sas-token
// To learn more, see https://github.com/Azure-Samples/functions-dotnet-sas-token/blob/master/README.md

var azure = require('azure-storage');

module.exports = function(context, req) {
    if (req.body.container) {
        // The following values can be used for permissions: 
        // "a" (Add), "r" (Read), "w" (Write), "d" (Delete), "l" (List)
        // Concatenate multiple permissions, such as "rwa" = Read, Write, Add
                
        context.res =
        {
            status: 200,
            headers: { 'Content-Type': 'text/plain' } ,
            body: generateSasToken(context, req.body.container, req.body.blobName, req.body.permissions) 
        }         
    } else {
        context.res = {
            status: 400,
            body: "Specify a value for 'container'"
        };
    }
    //context.log(context.res);
    context.done();
};

function generateSasToken(context, container, blobName, permissions) {
    var connString = process.env.AzureWebJobsStorage;
    var blobService = azure.createBlobService(connString);

    // Create a SAS token that expires in half an hour
    // Set start time to five minutes ago to avoid clock skew.
    var startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 5);
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 30);

    permissions = permissions || azure.BlobUtilities.SharedAccessPermissions.READ;

    var sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: permissions,
            Start: startDate,
            Expiry: expiryDate
        }
    };
    
    var sasToken = blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);
    
    return blobService.getUrl(container, blobName, sasToken, true);    
}