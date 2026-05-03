package com.aibh.security;

import com.aibh.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {
    
    private Long id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String role;
    private boolean enabled;
    private Collection<? extends GrantedAuthority> authorities;
    
    public UserPrincipal(Long id, String email, String password, String firstName, 
                        String lastName, String role, boolean enabled,
                        Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.enabled = enabled;
        this.authorities = authorities;
    }
    
    public static UserPrincipal create(User user) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
        
        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name(),
            user.getEnabled(),
            authorities
        );
    }
    
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getRole() { return role; }
    public String getFullName() { return firstName + " " + lastName; }
    
    @Override
    public String getUsername() { return email; }
    
    @Override
    public String getPassword() { return password; }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    
    @Override
    public boolean isAccountNonExpired() { return true; }
    
    @Override
    public boolean isAccountNonLocked() { return true; }
    
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    
    @Override
    public boolean isEnabled() { return enabled; }
}