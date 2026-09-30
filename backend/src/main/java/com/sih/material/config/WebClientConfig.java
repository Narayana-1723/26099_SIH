package com.sih.material.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Value("${ml.service-url:http://localhost:8000}")
    private String mlServiceUrl;

    @Value("${ml.connection-timeout:5000}")
    private int connectionTimeout;

    @Value("${ml.read-timeout:30000}")
    private int readTimeout;

    @Bean
    public WebClient mlWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(readTimeout));

        return WebClient.builder()
                .baseUrl(mlServiceUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .build();
    }
}
