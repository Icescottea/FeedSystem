# Use an official OpenJDK 21 image
FROM eclipse-temurin:21-jdk

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Make Maven wrapper executable
RUN chmod +x mvnw

# Build project
RUN ./mvnw clean install -DskipTests

# Expose port
EXPOSE 8080

# Run the app
CMD ["./mvnw", "spring-boot:run"]
