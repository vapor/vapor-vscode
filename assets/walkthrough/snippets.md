# Vapor Snippets
```swift
@Sendable
func functionName(req: Request) async throws -> ReturnValue {
    statements
}
```

# Fluent Snippets
```swift
final class MyModel: Model, @unchecked Sendable {
    static var name: String { "my_models" }

    @ID
    var id: UUID?

    Properties

    init() {}
}
```

# Leaf Snippets
```leaf
#extend("template"):
    #export("body"):
        
    #endexport
#endextend
```