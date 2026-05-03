package com.aibh.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Tag;
import io.micrometer.core.instrument.config.MeterFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.Arrays;

@Configuration
public class MetricsConfig {
    
    @Bean
    public MeterFilter metricsCommonTags() {
        return MeterFilter.commonTags(Arrays.asList(
            Tag.of("application", "ai-bh")
        ));
    }
    
    @Bean
    public Timer chatResponseTimer(MeterRegistry meterRegistry) {
        return Timer.builder("aibh.chat.response.time")
                .description("Time taken to process chat requests")
                .register(meterRegistry);
    }
    
    @Bean
    public Counter chatRequestCounter(MeterRegistry meterRegistry) {
        return Counter.builder("aibh.chat.requests.total")
                .description("Total number of chat requests")
                .register(meterRegistry);
    }
    
    @Bean
    public Counter authSuccessCounter(MeterRegistry meterRegistry) {
        return Counter.builder("aibh.auth.success.total")
                .description("Total number of successful authentications")
                .register(meterRegistry);
    }
    
    @Bean
    public Counter authFailureCounter(MeterRegistry meterRegistry) {
        return Counter.builder("aibh.auth.failure.total")
                .description("Total number of failed authentications")
                .register(meterRegistry);
    }
    
    @Bean
    public Counter rateLimitCounter(MeterRegistry meterRegistry) {
        return Counter.builder("aibh.ratelimit.exceeded.total")
                .description("Total number of rate limit violations")
                .register(meterRegistry);
    }
}