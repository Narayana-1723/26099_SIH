package com.sih.material;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class SihMaterialApplication {

    public static void main(String[] args) {
        SpringApplication.run(SihMaterialApplication.class, args);
    }
}

//mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081