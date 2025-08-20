# ---------- Build stage ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# 1) Copy only Maven wrapper + POM to cache deps
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Download deps (cached if pom.xml unchanged)
RUN ./mvnw -q -DskipTests dependency:go-offline

# 2) Copy sources and build
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# copy the fat jar from build stage
COPY --from=build /app/target/*.jar app.jar

# good default for PDF libs using AWT
ENV JAVA_TOOL_OPTIONS="-Djava.awt.headless=true"

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
