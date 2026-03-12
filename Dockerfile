FROM maven:3.8.4-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN mkdir -p /app/uploads && \
    chmod 755 /app/uploads
COPY --from=builder /app/target/*.jar /app/app.jar
RUN ls -la /app/
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]