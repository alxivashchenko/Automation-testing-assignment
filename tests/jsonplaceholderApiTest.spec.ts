import { test, expect } from "@playwright/test";

test.describe("Testing of GET method", () => {
  test.describe("Positive test cases for GET method", () => {
    test("Retrieve all posts from the endpoint", async ({
      request,
      baseURL,
    }) => {
      const response = await request.get(`${baseURL}/posts`);
      const responseBody = await response.json();
      const contentType = response.headers()["content-type"];

      expect(response.status()).toBe(200);
      expect(contentType).toContain("application/json");
      expect(Array.isArray(responseBody)).toBeTruthy();
      expect(responseBody.length).toBeGreaterThan(0);
    });

    test("Retrieve a specific post by its ID", async ({ request, baseURL }) => {
      const postId = 1;
      const response = await request.get(`${baseURL}/posts/${postId}`);
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(responseBody).toHaveProperty("userId");
      expect(responseBody).toHaveProperty("id");
      expect(responseBody).toHaveProperty("title");
      expect(responseBody).toHaveProperty("body");
      expect(responseBody.userId).toBe(1);
      expect(responseBody.id).toBe(postId);
      expect(typeof responseBody.title).toBe("string");
      expect(typeof responseBody.body).toBe("string");
      expect(responseBody.title).not.toBeNull();
      expect(responseBody.body).not.toBeNull();
    });

    test("Retrieve posts with query parameters", async ({
      request,
      baseURL,
    }) => {
      const userId = 1;
      const response = await request.get(`${baseURL}/posts`, {
        params: { userId },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(Array.isArray(responseBody)).toBeTruthy();
      expect(responseBody.length).toBeGreaterThan(0);
      for (const post of responseBody) {
        expect(post.userId).toBe(userId);
      }
    });

    test("Verify API Response Time", async ({ request, baseURL }) => {
      const startTime = Date.now();
      const response = await request.get(`${baseURL}/posts/1`);
      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThanOrEqual(2000);
      console.log(`Response Time: ${responseTime} ms`);
    });
  });

  test.describe("Negative test cases for GET method", () => {
    test("Retrieve a non-existent post by ID", async ({ request, baseURL }) => {
      const nonExistentId = 9999999999;
      const response = await request.get(`${baseURL}/posts/${nonExistentId}`);
      const responseBody = await response.json();

      expect(response.status()).toBe(404);
      expect(responseBody).toEqual({});
    });

    test("Retrieve posts with non-existent userId query parameter", async ({
      request,
      baseURL,
    }) => {
      const userId = 1000000;
      const response = await request.get(`${baseURL}/posts`, {
        params: { userId },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(Array.isArray(responseBody)).toBeTruthy();
      expect(responseBody.length).toBe(0);
    });

    test("Retrieve post with string ID", async ({ request, baseURL }) => {
      const postId = "qwerty";
      const response = await request.get(`${baseURL}/posts/${postId}`);
      const responseBody = await response.json();

      expect(response.status()).toBe(404);
      expect(responseBody).toEqual({});
    });

    test("Retrieve post with special symbols in ID", async ({
      request,
      baseURL,
    }) => {
      const postId = "!@#$%^&*()";
      const response = await request.get(`${baseURL}/posts/${postId}`);
      const responseBody = await response.json();

      expect(response.status()).toBe(404);
      expect(responseBody).toEqual({});
    });

    test("Retrieve post with SQL injection attempt", async ({
      request,
      baseURL,
    }) => {
      const postId = "1; DROP TABLE users";
      const response = await request.get(`${baseURL}/posts/${postId}`);
      const responseBody = await response.json();

      expect(response.status()).toBe(404);
      expect(responseBody).toEqual({});
    });
  });
});

test.describe("Testing of POST method", () => {
  test.describe("Positive test cases for POST method", () => {
    test("Create a post with valid data", async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}/posts`, {
        data: {
          title: "New Post",
          body: "The body of new post",
          userId: 1,
        },
      });
      const responseBody = await response.json();
      const contentType = response.headers()["content-type"];

      expect(response.status()).toBe(201);
      expect(contentType).toContain("application/json");
      expect(responseBody).toHaveProperty("id");
      expect(responseBody.title).toBe("New Post");
      expect(responseBody.body).toBe("The body of new post");
      expect(responseBody.userId).toBe(1);
    });

    test("Create a post with minimal required data", async ({
      request,
      baseURL,
    }) => {
      const response = await request.post(`${baseURL}/posts`, {
        data: {
          title: "Minimal Post",
          userId: 1,
        },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(201);
      expect(responseBody).toHaveProperty("id");
      expect(responseBody.title).toBe("Minimal Post");
      expect(responseBody.body).toBeFalsy();
      expect(responseBody.userId).toBe(1);
    });

    test("Verify API Response Time", async ({ request, baseURL }) => {
      const startTime = Date.now();
      const response = await request.post(`${baseURL}/posts`, {
        data: {
          title: "New Post",
          body: "The body of the new post",
          userId: 1,
        },
      });
      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(201);
      expect(responseTime).toBeLessThanOrEqual(2000);
      console.log(`Response Time: ${responseTime} ms`);
    });
  });

  test.describe("Negative test cases for POST method", () => {
    test("Send an empty request body", async ({ request, baseURL }) => {
      const response = await request.post(`${baseURL}/posts`, {
        data: {},
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(201);
      expect(responseBody).toHaveProperty("id");
      expect(responseBody.title).toBeUndefined();
      expect(responseBody.body).toBeUndefined();
      expect(responseBody.userId).toBeUndefined();
    });

    test("Send a post with invalid data types", async ({
      request,
      baseURL,
    }) => {
      const response = await request.post(`${baseURL}/posts`, {
        data: {
          title: 123456789,
          body: false,
          userId: "not-a-number",
        },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(201);
      expect(typeof responseBody.title).toBe("number"); // Mock API accept invalid types
      expect(typeof responseBody.body).toBe("boolean"); // Mock API accept invalid types
      expect(typeof responseBody.userId).toBe("string"); // Mock API accept invalid types
    });

    test("Send a request body with extra field", async ({
      request,
      baseURL,
    }) => {
      const response = await request.post(`${baseURL}/posts`, {
        data: {
          title: "New Post",
          extrafield: "Extra field",
          body: "The body of the new post",
          userId: 1,
        },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(201);
      expect(responseBody).toHaveProperty("id");
      expect(responseBody.title).toBe("New Post");
      expect(responseBody.extrafield).toBe("Extra field");
      expect(responseBody.body).toBe("The body of the new post");
      expect(responseBody.userId).toBe(1);
    });

    test("Send a post with missing required fields", async ({
      request,
      baseURL,
    }) => {
      const response = await request.post(`${baseURL}/posts`, {
        data: {
          body: "The post without title",
        },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(201);
      expect(responseBody).toHaveProperty("id");
      expect(responseBody.title).toBeUndefined();
      expect(responseBody.body).toBe("The post without title");
    });

    test("Send a post with special characters", async ({
      request,
      baseURL,
    }) => {
      const response = await request.post(`${baseURL}/posts`, {
        data: {
          title: 'Title !@#$%^&*(){}[]_+=|;:"<>,.?/',
          body: 'Body !@#$%^&*(){}[]_+=|;:"<>,.?/',
          userId: 1,
        },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(201);
      expect(responseBody).toHaveProperty("id");
      expect(responseBody.title).toBe('Title !@#$%^&*(){}[]_+=|;:"<>,.?/');
      expect(responseBody.body).toBe('Body !@#$%^&*(){}[]_+=|;:"<>,.?/');
    });

    test("Send a post with large payload", async ({ request, baseURL }) => {
      const largeBody = "a".repeat(100000);
      const response = await request.post(`${baseURL}/posts`, {
        data: {
          title: "Large payload test",
          body: largeBody,
          userId: 1,
        },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(201);
      expect(responseBody).toHaveProperty("id");
      expect(responseBody.body.length).toBe(100000);
    });

    test("Send a post with SQL injection attempt", async ({
      request,
      baseURL,
    }) => {
      const response = await request.post(`${baseURL}/posts`, {
        data: {
          title: "SQL Injection",
          body: "SQL Injection attempt",
          userId: "1; DROP TABLE users",
        },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(201);
      expect(responseBody).toHaveProperty("id");
      expect(responseBody.userId).toBe("1; DROP TABLE users");
    });

    test("Send a post to a non-existent endpoind", async ({
      request,
      baseURL,
    }) => {
      const response = await request.post(`${baseURL}/invalid-endpoint`, {
        data: {
          title: "Invalid endpoint test",
          body: "Body of invalid endpoint test",
          userId: 1,
        },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(404);
    });
  });
});

test.describe("Testing of PUT method", () => {
  test.describe("Positive test cases for PUT method", () => {
    test("Update an existing post with valid data", async ({
      request,
      baseURL,
    }) => {
      const response = await request.put(`${baseURL}/posts/1`, {
        data: {
          id: 1,
          title: "Updated title",
          body: "The updated body",
          userId: 1,
        },
      });
      const responseBody = await response.json();
      const contentType = response.headers()["content-type"];

      expect(response.status()).toBe(200);
      expect(contentType).toContain("application/json");
      expect(responseBody.id).toBe(1);
      expect(responseBody.title).toBe("Updated title");
      expect(responseBody.body).toBe("The updated body");
      expect(responseBody.userId).toBe(1);
    });

    test("Update only some fields of a post", async ({ request, baseURL }) => {
      const response = await request.put(`${baseURL}/posts/1`, {
        data: {
          id: 1,
          title: "Partialy updated title",
        },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(responseBody.id).toBe(1);
      expect(responseBody.title).toBe("Partialy updated title");
      expect(responseBody.body).toBeUndefined();
      expect(responseBody.userId).toBeUndefined();
    });

    test("Verify API Response Time", async ({ request, baseURL }) => {
      const startTime = Date.now();
      const response = await request.put(`${baseURL}/posts/1`, {
        data: {
          id: 1,
          title: "Updated title",
          body: "The updated body",
          userId: 1,
        },
      });
      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThanOrEqual(2000);
      console.log(`Response Time: ${responseTime} ms`);
    });
  });

  test.describe("Negative test cases for PUT method", () => {
    test("Update non-existing post", async ({ request, baseURL }) => {
      const nonExistentPostId = 999999999;
      const response = await request.put(
        `${baseURL}/posts/${nonExistentPostId}`,
        {
          data: {
            id: 1,
            title: "The title for non-existing post",
            body: "The body for non-existing post",
            userId: 1,
          },
        }
      );

      expect(response.status()).toBe(500);
    });

    test("Update a post with missing required fields", async ({
      request,
      baseURL,
    }) => {
      const response = await request.put(`${baseURL}/posts/1`, {
        data: {},
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(responseBody.id).toBe(1);
      expect(responseBody.title).toBeUndefined();
      expect(responseBody.body).toBeUndefined();
      expect(responseBody.userId).toBeUndefined();
    });

    test("Send a PUT request with invalid data types", async ({
      request,
      baseURL,
    }) => {
      const response = await request.put(`${baseURL}/posts/1`, {
        data: {
          id: "not-a-number",
          title: 123456789,
          body: true,
          userId: "invalid-user-id",
        },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(typeof responseBody.id).toBe("number"); // Mock API accept invalid types
      expect(typeof responseBody.title).toBe("number"); // Mock API accept invalid types
      expect(typeof responseBody.body).toBe("boolean"); // Mock API accept invalid types
      expect(typeof responseBody.userId).toBe("string"); // Mock API accept invalid types
    });

    test("Send a PUT request with special characters", async ({
      request,
      baseURL,
    }) => {
      const response = await request.put(`${baseURL}/posts/1`, {
        data: {
          id: 1,
          title: 'Title with Special Characters !@#$%^&*(){}[]_+=|;:"<>,.?/',
          body: 'Body containing <script>alert("XSS")</script>',
          userId: 1,
        },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(responseBody.id).toBe(1);
      expect(responseBody.title).toBe(
        'Title with Special Characters !@#$%^&*(){}[]_+=|;:"<>,.?/'
      );
      expect(responseBody.body).toBe(
        'Body containing <script>alert("XSS")</script>'
      );
      expect(responseBody.userId).toBe(1);
    });
  });
});

test.describe("Testing of DELETE method", () => {
  test.describe("Positive test cases for DELETE method", () => {
    test("Delete an existing post", async ({ request, baseURL }) => {
      const postId = 1;
      const response = await request.delete(`${baseURL}/posts/${postId}`);
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(responseBody).toEqual({}); //JSONPlaceholder  return empty object
    });

    test("Delete with query parameters", async ({ request, baseURL }) => {
      const postId = 1;
      const userId = 1;
      const response = await request.delete(`${baseURL}/posts/${postId}`, {
        params: { userId },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(responseBody).toEqual({});
    });

    test("Verify API Response Time", async ({ request, baseURL }) => {
      const startTime = Date.now();
      const response = await request.delete(`${baseURL}/posts/1`);
      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThanOrEqual(2000);
      console.log(`Response Time: ${responseTime} ms`);
    });
  });

  test.describe("Negative test cases for DELETE method", () => {
    test("Delete non-existing post", async ({ request, baseURL }) => {
      const nonExistingPostId = 999999999;
      const response = await request.delete(
        `${baseURL}/posts/${nonExistingPostId}`
      );
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(responseBody).toEqual({});
    });

    test("Delete post with invalid ID", async ({ request, baseURL }) => {
      const invalidPostId = "invalid-id";
      const response = await request.delete(
        `${baseURL}/posts/${invalidPostId}`
      );
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(responseBody).toEqual({});
    });

    test("Delete a post using special characters in ID", async ({
      request,
      baseURL,
    }) => {
      const postId = "%21%40%23%24";
      const response = await request.delete(`${baseURL}/posts/${postId}`);
      const responseBody = await response.json();

      expect(response.status()).toBe(200); //JSONPlaceholder  return 200
      expect(responseBody).toEqual({});
    });

    test("Delete with extra query parameters", async ({ request, baseURL }) => {
      const extraParameter = "testValue";
      const response = await request.delete(`${baseURL}/posts/1`, {
        params: { extraParameter },
      });
      const responseBody = await response.json();

      expect(response.status()).toBe(200);
      expect(responseBody).toEqual({});
    });

    test("Delete with missing ID in the URL", async ({ request, baseURL }) => {
      const response = await request.delete(`${baseURL}/posts/`);

      expect(response.status()).toBe(404);
    });
  });
});
