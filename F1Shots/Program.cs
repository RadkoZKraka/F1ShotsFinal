using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using F1Shots.Services;
using F1Shots.Storage;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;

namespace F1Shots;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddDatabaseDeveloperPageExceptionFilter();
        builder.Services.AddControllers();

        // Register MongoDB connection and IMongoDatabase
        var mongoDbConnectionString = builder.Configuration.GetSection("MongoDB:ConnectionString").Value;
        var mongoClient = new MongoClient(mongoDbConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(builder.Configuration.GetSection("MongoDB:Database").Value); // Use the Database name from the configuration

        // Register IMongoDatabase as a singleton
        builder.Services.AddSingleton<IMongoDatabase>(mongoDatabase);

        // Register GroupService and UserService (Scoped for each request)
        builder.Services.AddScoped<GroupService>();
        builder.Services.AddScoped<UserService>();
        builder.Services.AddScoped<UserRelationsService>();
        builder.Services.AddScoped<GroupRelationsService>();
        builder.Services.AddScoped<NotificationService>();
        builder.Services.AddScoped<CommonService>();
        

        // Register GroupStorage and UserStorage (Scoped to services)
        builder.Services.AddScoped<GroupStorage>();
        builder.Services.AddScoped<UserStorage>();
        builder.Services.AddScoped<NotificationStorage>();
        builder.Services.AddScoped<UserRelationsStorage>();
        builder.Services.AddScoped<GroupRelationsStorage>();
        

        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });

        // Add JWT Authentication
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,  // Token lifetime will be validated
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
                };
                
            });

        var app = builder.Build();

        // Middleware
        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseCors(); // Apply CORS policy
        app.UseAuthentication(); // Enable authentication
        app.UseAuthorization();  // Enable authorization

        app.MapControllers(); // Map the controllers

        app.Run();
    }
}
