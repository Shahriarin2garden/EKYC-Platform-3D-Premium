// SonarLint Test File - This file intentionally contains code issues

function testFunction() {
  // Issue: Unused variable
  var unusedVar = "This is unused";
  
  // Issue: Using var instead of const/let
  var x = 5;
  
  // Issue: Console.log in production code
  console.log("Debug message");
  
  // Issue: Empty block
  if (x == 5) {
    
  }
  
  // Issue: Using == instead of ===
  if (x == 5) {
    return true;
  }
  
  // Issue: Unreachable code
  return false;
  console.log("This will never execute");
}

// Issue: Function never used
function anotherUnusedFunction() {
  var password = "hardcoded-password"; // Security issue
  return password;
}

// Issue: Cognitive complexity
function complexFunction(a, b, c) {
  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        if (a + b > c) {
          if (b + c > a) {
            if (a + c > b) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}

// Issue: Too many parameters
function tooManyParams(a, b, c, d, e, f, g, h) {
  return a + b + c + d + e + f + g + h;
}

testFunction();
