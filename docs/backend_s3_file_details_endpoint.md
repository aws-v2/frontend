# Backend Implementation: S3 File Details Endpoint

## Problem
The frontend is making a `GET` request to `/api/v1/s3/files/{bucketId}/{objectKey}` to fetch individual file/object details, but this endpoint doesn't exist on the backend, resulting in a **404 Not Found** error.

**Current Frontend Request:**
```
GET http://localhost:8080/api/v1/s3/files/sdfsdfs/wps_office_inst.exe
```

**Expected Response Format:**
```json
{
  "code": 200,
  "message": "File details retrieved successfully",
  "data": {
    "key": "wps_office_inst.exe",
    "size": 123456789,
    "last_modified": "2026-02-15T07:20:00Z",
    "mime_type": "application/x-msdownload",
    "storage_class": "Standard",
    "etag": "519a8b3308872b0ed015963c9f3fc623",
    "tags": [
      { "key": "Environment", "value": "Production" }
    ]
  }
}
```

---

## Backend Implementation Guide

### 1. Create the Endpoint

**Language**: Go (assumed based on your microservices architecture)

**File**: `s3-service/internal/handlers/file_handler.go` (or similar)

```go
// GetFileDetails retrieves detailed information about a specific S3 object
func (h *FileHandler) GetFileDetails(c *gin.Context) {
    bucketName := c.Param("bucketId")
    objectKey := c.Param("objectKey")
    
    // Get user context from JWT
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, response.Error(401, "Unauthorized"))
        return
    }
    
    // Fetch object metadata from MinIO/S3
    objectInfo, err := h.s3Client.StatObject(c.Request.Context(), bucketName, objectKey, minio.StatObjectOptions{})
    if err != nil {
        c.JSON(http.StatusNotFound, response.Error(404, fmt.Sprintf("Object not found: %s", err.Error())))
        return
    }
    
    // Get object tags (optional)
    tags, _ := h.s3Client.GetObjectTagging(c.Request.Context(), bucketName, objectKey, minio.GetObjectTaggingOptions{})
    
    // Build response
    fileDetails := map[string]interface{}{
        "key":           objectKey,
        "size":          objectInfo.Size,
        "last_modified": objectInfo.LastModified,
        "mime_type":     objectInfo.ContentType,
        "storage_class": objectInfo.StorageClass,
        "etag":          strings.Trim(objectInfo.ETag, "\""),
        "tags":          formatTags(tags),
    }
    
    c.JSON(http.StatusOK, response.Success(fileDetails, "File details retrieved successfully"))
}

// Helper to format tags
func formatTags(tagSet map[string]string) []map[string]string {
    var tags []map[string]string
    for k, v := range tagSet {
        tags = append(tags, map[string]string{"key": k, "value": v})
    }
    return tags
}
```

---

### 2. Register the Route

**File**: `s3-service/internal/routes/routes.go`

```go
func SetupRoutes(router *gin.Engine, fileHandler *handlers.FileHandler) {
    api := router.Group("/api/v1")
    {
        s3 := api.Group("/s3")
        {
            // Existing routes
            s3.GET("/buckets", fileHandler.ListBuckets)
            s3.GET("/files/:bucketId", fileHandler.ListFiles)
            
            // NEW ROUTE - File Details
            s3.GET("/files/:bucketId/*objectKey", fileHandler.GetFileDetails)
        }
    }
}
```

> **IMPORTANT**: Use `*objectKey` to capture paths with slashes (e.g., `folder/subfolder/file.exe`)

---

### 3. Add Authorization (IAM Check via NATS)

Before returning file details, check permissions:

```go
// Request IAM authorization
authRequest := map[string]interface{}{
    "actor_id": userID,
    "action": "s3:GetObject",
    "resource_arn": fmt.Sprintf("arn:serw:s3:eu-north-1:%s:object/%s/%s", userID, bucketName, objectKey),
}

// Publish to NATS (prod.iam.v1.access.authorize)
authResponse, err := h.natsClient.Request("prod.iam.v1.access.authorize", authRequest, 5*time.Second)
if err != nil || authResponse.Decision != "Allow" {
    c.JSON(http.StatusForbidden, response.Error(403, "Access denied"))
    return
}
```

---

## Testing

### cURL Test
```bash
curl -X GET "http://localhost:8080/api/v1/s3/files/sdfsdfs/wps_office_inst.exe" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Expected Success Response
```json
{
  "code": 200,
  "message": "File details retrieved successfully",
  "data": {
    "key": "wps_office_inst.exe",
    "size": 123456789,
    "last_modified": "2026-02-15T07:20:00.000Z",
    "mime_type": "application/x-msdownload",
    "storage_class": "Standard",
    "etag": "519a8b3308872b0ed015963c9f3fc623",
    "tags": []
  }
}
```

---

## Summary

1. **Create** `GetFileDetails` handler in `file_handler.go`
2. **Register** route as `GET /api/v1/s3/files/:bucketId/*objectKey`
3. **Integrate** IAM authorization via NATS
4. **Return** standardized response with file metadata

This will resolve the 404 error and enable the Object Details page to display real data instead of placeholder values.
