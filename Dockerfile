# Stage 1 — build the jar with Maven
FROM maven:3.9.3-eclipse-temurin-17 AS build

WORKDIR /workspace

# Copy only Maven config first for caching
COPY pom.xml mvnw ./
COPY .mvn .mvn

# If you use settings.xml or other build files, copy them here

# Make mvnw executable (defensive)
RUN chmod +x mvnw

# Copy source code
COPY src ./src

# Build (skip tests to speed up). Produces target/*.jar
RUN ./mvnw -DskipTests package

# Stage 2 — runtime image
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy the jar from builder (assumes single jar in target)
COPY --from=build /workspace/target/*.jar app.jar

# Expose the port (Render uses $PORT env var at runtime)
EXPOSE 8888

# Entrypoint: use Render's PORT env var when provided
ENTRYPOINT ["sh","-c","java -Dserver.port=${PORT:-8888} -jar /app/app.jar"]
