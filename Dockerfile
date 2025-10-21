# ---------- Stage 1 — Build the JAR using Maven + JDK 23 ----------
FROM maven:3.9.9-eclipse-temurin-23 AS build

# Set working directory inside container
WORKDIR /workspace

# Copy Maven files first for build cache optimization
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Ensure Maven wrapper is executable
RUN chmod +x mvnw

# Copy source code
COPY src ./src

# Build the project (skip tests for faster build)
RUN ./mvnw -DskipTests clean package


# ---------- Stage 2 — Runtime Image with JRE 23 ----------
FROM eclipse-temurin:23-jre-jammy

# Working directory for the running app
WORKDIR /app

# Copy the built jar from the previous stage
COPY --from=build /workspace/target/*.jar app.jar

# Expose port (Render assigns PORT automatically)
EXPOSE 8888

# Run the jar using Render’s PORT environment variable
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8888} -jar /app/app.jar"]
