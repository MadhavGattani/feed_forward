# ---------- Stage 1 — Build using OpenJDK 23 (mvnw will download Maven) ----------
FROM openjdk:23-jdk AS build

WORKDIR /workspace

# Copy maven wrapper files and pom first for caching
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Make mvnw executable (defensive)
RUN chmod +x mvnw

# Copy source
COPY src ./src

# Build the application (skip tests to speed up)
RUN ./mvnw -DskipTests clean package


# ---------- Stage 2 — Runtime image (smaller) using OpenJDK 23 slim ----------
FROM openjdk:23-jdk-slim

WORKDIR /app

# Copy JAR from build stage
COPY --from=build /workspace/target/*.jar app.jar

# Expose port (Render provides PORT env var at runtime)
EXPOSE 8888

# Start the app using Render's PORT variable if available
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8888} -jar /app/app.jar"]
